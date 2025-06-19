export interface OptimizeResumeOptions {
  template?: string;
  sectionOrdering?: string[];
  improveResume?: boolean;
  modelType?: string;
  model?: string;
}

export interface GenerateCoverLetterOptions {
  modelType?: string;
  model?: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  linkedin?: string;
}

export interface CompanyInfo {
  position: string;
  company_name: string;
  location: string;
  hiring_manager?: string;
  department?: string;
}

export interface OptimizeResumeRequest {
  file_id: string;
  job_description: string;
  template: string;
  api_key: string;
  model_type?: string;
  model?: string;
  section_ordering?: string[];
  improve_resume?: boolean;
}

export interface GenerateCoverLetterRequest {
  file_id: string;
  job_description: string;
  api_key: string;
  personal_info: PersonalInfo;
  company_info: CompanyInfo;
  model_type?: string;
  model?: string;
}

export class PDFGenerationService {
  private static readonly API_BASE_URL = import.meta.env.VITE_RESUME_API_BASE_URL || 'https://752e-108-18-123-32.ngrok-free.app';
  private static readonly API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  private static readonly DEFAULT_MODEL_TYPE = import.meta.env.VITE_RESUME_API_MODEL_TYPE || 'OpenAI';
  private static readonly DEFAULT_MODEL = import.meta.env.VITE_RESUME_API_MODEL || 'gpt-4o';

  // Available LaTeX templates - Updated to match your backend
  static readonly AVAILABLE_TEMPLATES = [
    'Simple',
    'Modern', 
    'Awesome',
    'Deedy',
    'BGJC',
    'Plush',
    'Alta'
  ];

  // Generate optimized resume PDF
  static async optimizeResume(
    fileId: string,
    jobDescription: string,
    options: OptimizeResumeOptions = {}
  ): Promise<Blob> {
    try {
      // Validate API key
      if (!this.API_KEY) {
        throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables.');
      }

      // Validate inputs
      if (!fileId || !jobDescription.trim()) {
        throw new Error('File ID and job description are required for resume optimization');
      }

      // Validate template
      const template = options.template || 'Modern';
      if (!this.validateTemplate(template)) {
        throw new Error(`Invalid template "${template}". Available templates: ${this.AVAILABLE_TEMPLATES.join(', ')}`);
      }

      const requestData: OptimizeResumeRequest = {
        file_id: fileId,
        job_description: jobDescription,
        template: template,
        api_key: this.API_KEY,
        model_type: options.modelType || this.DEFAULT_MODEL_TYPE,
        model: options.model || this.DEFAULT_MODEL,
        section_ordering: options.sectionOrdering || ['education', 'work', 'skills'],
        improve_resume: options.improveResume !== false // Default to true
      };

      console.log('Making optimize resume request to:', `${this.API_BASE_URL}/api/optimize-resume`);
      console.log('Using template:', requestData.template);
      console.log('File ID:', fileId);

      const response = await fetch(`${this.API_BASE_URL}/api/optimize-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestData),
        // 3 minutes timeout for PDF generation
        signal: AbortSignal.timeout(180000)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/pdf')) {
        // Try to parse as JSON to get error message
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || 'Expected PDF but received different content type');
        } catch (jsonError) {
          throw new Error('Expected PDF but received different content type');
        }
      }

      const pdfBlob = await response.blob();
      
      if (pdfBlob.size === 0) {
        throw new Error('Received empty PDF file');
      }

      console.log('Resume optimization successful, PDF size:', pdfBlob.size, 'bytes');
      return pdfBlob;

    } catch (error: any) {
      console.error('Error optimizing resume:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('PDF generation timed out. The process is taking longer than expected. Please try again.');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the PDF generation service. Please check your internet connection and try again.');
      }

      if (error.message.includes('file_id not found') || error.message.includes('resume data not found')) {
        throw new Error('Resume data not found. Please re-upload your resume and try the AI enhancement process again.');
      }

      if (error.message.includes('LaTeX') || error.message.includes('template')) {
        throw new Error(`PDF template processing failed. Please try a different template. Available templates: ${this.AVAILABLE_TEMPLATES.join(', ')}`);
      }
      
      throw new Error(error.message || 'Failed to generate optimized resume PDF');
    }
  }

  // Generate cover letter PDF - Updated to match new API format
  static async generateCoverLetter(
    fileId: string,
    jobDescription: string,
    position: string,
    companyName: string,
    location: string,
    personalInfo: PersonalInfo,
    options: GenerateCoverLetterOptions = {}
  ): Promise<Blob> {
    try {
      // Validate API key
      if (!this.API_KEY) {
        throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables.');
      }

      // Validate inputs
      if (!fileId || !jobDescription.trim() || !position.trim() || !companyName.trim()) {
        throw new Error('File ID, job description, position, and company name are required for cover letter generation');
      }

      if (!personalInfo.name || !personalInfo.email) {
        throw new Error('Personal name and email are required for cover letter generation');
      }

      // Build the request data according to the new API format
      const requestData: GenerateCoverLetterRequest = {
        file_id: fileId,
        job_description: jobDescription,
        api_key: this.API_KEY,
        personal_info: {
          name: personalInfo.name,
          email: personalInfo.email,
          phone: personalInfo.phone || '',
          address: personalInfo.address || '',
          linkedin: personalInfo.linkedin || ''
        },
        company_info: {
          position: position,
          company_name: companyName,
          location: location || '',
          hiring_manager: '', // Could be extracted from job description or added as optional parameter
          department: '' // Could be extracted from job description or added as optional parameter
        },
        model_type: options.modelType || this.DEFAULT_MODEL_TYPE,
        model: options.model || this.DEFAULT_MODEL
      };

      console.log('Making generate cover letter request to:', `${this.API_BASE_URL}/api/generate-cover-letter`);
      console.log('Position:', position);
      console.log('Company:', companyName);
      console.log('File ID:', fileId);

      const response = await fetch(`${this.API_BASE_URL}/api/generate-cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestData),
        // 3 minutes timeout for PDF generation
        signal: AbortSignal.timeout(180000)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/pdf')) {
        // Try to parse as JSON to get error message
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || 'Expected PDF but received different content type');
        } catch (jsonError) {
          throw new Error('Expected PDF but received different content type');
        }
      }

      const pdfBlob = await response.blob();
      
      if (pdfBlob.size === 0) {
        throw new Error('Received empty PDF file');
      }

      console.log('Cover letter generation successful, PDF size:', pdfBlob.size, 'bytes');
      return pdfBlob;

    } catch (error: any) {
      console.error('Error generating cover letter:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('PDF generation timed out. The process is taking longer than expected. Please try again.');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the PDF generation service. Please check your internet connection and try again.');
      }

      if (error.message.includes('file_id not found') || error.message.includes('resume data not found')) {
        throw new Error('Resume data not found. Please re-upload your resume and try the AI enhancement process again.');
      }

      if (error.message.includes('LaTeX') || error.message.includes('template')) {
        throw new Error('PDF template processing failed. Please contact support for assistance.');
      }
      
      throw new Error(error.message || 'Failed to generate cover letter PDF');
    }
  }

  // Download blob as file
  static downloadBlob(blob: Blob, filename: string): void {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file');
    }
  }

  // Get current configuration for debugging
  static getConfiguration() {
    return {
      apiBaseUrl: this.API_BASE_URL,
      hasApiKey: !!this.API_KEY,
      defaultModelType: this.DEFAULT_MODEL_TYPE,
      defaultModel: this.DEFAULT_MODEL,
      availableTemplates: this.AVAILABLE_TEMPLATES
    };
  }

  // Validate template name
  static validateTemplate(template: string): boolean {
    return this.AVAILABLE_TEMPLATES.includes(template);
  }

  // Extract personal info from parsed resume data - Updated to include address and linkedin
  static extractPersonalInfo(parsedResume: any): PersonalInfo {
    const personal = parsedResume?.personal || {};
    return {
      name: personal.name || 'Unknown',
      email: personal.email || 'unknown@email.com',
      phone: personal.phone || '',
      address: personal.location || '', // Use location as address
      linkedin: personal.linkedin || ''
    };
  }

  // Extract job details from application data
  static extractJobDetails(applicationData: any): { position: string; companyName: string; location: string } {
    return {
      position: applicationData?.position || 'Position',
      companyName: applicationData?.company_name || 'Company',
      location: applicationData?.location || ''
    };
  }

  // Get template descriptions for UI
  static getTemplateDescriptions(): Record<string, string> {
    return {
      'Simple': 'Clean and minimalist design with clear sections',
      'Modern': 'Contemporary layout with subtle design elements',
      'Awesome': 'Eye-catching design with modern typography',
      'Deedy': 'Professional academic-style template',
      'BGJC': 'Business-focused layout with traditional styling',
      'Plush': 'Elegant design with refined typography',
      'Alta': 'Sophisticated template with premium appearance'
    };
  }

  // Helper method to build company info from job description and application data
  static buildCompanyInfo(
    position: string,
    companyName: string,
    location: string,
    jobDescription?: string
  ): CompanyInfo {
    // Try to extract hiring manager and department from job description
    let hiringManager = '';
    let department = '';

    if (jobDescription) {
      // Simple regex patterns to extract common information
      const hiringManagerMatch = jobDescription.match(/(?:contact|reach out to|hiring manager|recruiter)[\s:]*([A-Z][a-z]+ [A-Z][a-z]+)/i);
      if (hiringManagerMatch) {
        hiringManager = hiringManagerMatch[1];
      }

      const departmentMatch = jobDescription.match(/(?:department|team|division)[\s:]*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i);
      if (departmentMatch) {
        department = departmentMatch[1];
      }

      // Common department keywords
      const deptKeywords = ['Engineering', 'Technology', 'IT', 'Software', 'Development', 'Product', 'Marketing', 'Sales', 'HR', 'Human Resources', 'Finance', 'Operations'];
      for (const keyword of deptKeywords) {
        if (jobDescription.toLowerCase().includes(keyword.toLowerCase())) {
          department = department || keyword;
          break;
        }
      }
    }

    return {
      position,
      company_name: companyName,
      location,
      hiring_manager: hiringManager,
      department: department
    };
  }
}