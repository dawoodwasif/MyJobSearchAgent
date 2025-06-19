export interface ResumeExtractionOptions {
  modelType?: string;
  model?: string;
  fileId?: string;
}

export interface ResumeExtractionResponse {
  success: boolean;
  resume_json: any;
  extracted_text_length: number;
  message?: string;
  error?: string;
}

export class ResumeExtractionService {
  private static readonly API_BASE_URL = 'https://752e-108-18-123-32.ngrok-free.app';
  private static readonly API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'your-openai-api-key-here';

  static async extractResumeJson(
    file: File, 
    options: ResumeExtractionOptions = {}
  ): Promise<ResumeExtractionResponse> {
    try {
      // Create form data
      const formData = new FormData();
      
      // Add the resume file
      formData.append('file', file);
      
      // Add required API key
      formData.append('api_key', this.API_KEY);
      
      // Add optional parameters
      formData.append('model_type', options.modelType || 'OpenAI');
      formData.append('model', options.model || 'gpt-4o');
      formData.append('file_id', options.fileId || `req_${Date.now()}`);

      // Make the request
      const response = await fetch(`${this.API_BASE_URL}/api/extract-resume-json`, {
        method: 'POST',
        body: formData,
        headers: {
          // Add ngrok headers if needed
          'ngrok-skip-browser-warning': 'true'
        },
        // 60 second timeout for AI processing
        signal: AbortSignal.timeout(60000)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error extracting resume JSON:', error);
      throw new Error(error.message || 'Failed to extract resume data');
    }
  }

  // Validate file before processing
  static validateResumeFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Only PDF, Word documents, and text files are supported'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB'
      };
    }

    return { isValid: true };
  }

  // Parse the extracted resume JSON into a structured format
  static parseResumeData(resumeJson: any): any {
    try {
      // Handle different possible response formats
      let parsedData = resumeJson;
      
      if (typeof resumeJson === 'string') {
        parsedData = JSON.parse(resumeJson);
      }

      // Normalize the data structure
      return {
        personal: {
          name: parsedData.name || parsedData.full_name || '',
          email: parsedData.email || '',
          phone: parsedData.phone || parsedData.phone_number || '',
          location: parsedData.location || parsedData.address || '',
          linkedin: parsedData.linkedin || parsedData.linkedin_url || '',
          website: parsedData.website || parsedData.portfolio || ''
        },
        education: Array.isArray(parsedData.education) ? parsedData.education.map((edu: any) => ({
          school: edu.school || edu.institution || edu.university || '',
          degree: edu.degree || edu.degree_type || '',
          field: edu.field || edu.major || edu.field_of_study || '',
          gpa: edu.gpa || '',
          start_date: edu.start_date || edu.from || '',
          end_date: edu.end_date || edu.to || '',
          location: edu.location || ''
        })) : [],
        experience: Array.isArray(parsedData.experience) ? parsedData.experience.map((exp: any) => ({
          company: exp.company || exp.employer || '',
          position: exp.position || exp.title || exp.job_title || '',
          start_date: exp.start_date || exp.from || '',
          end_date: exp.end_date || exp.to || '',
          location: exp.location || '',
          highlights: Array.isArray(exp.highlights) ? exp.highlights : 
                     Array.isArray(exp.responsibilities) ? exp.responsibilities :
                     typeof exp.description === 'string' ? [exp.description] : []
        })) : [],
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : 
               typeof parsedData.skills === 'string' ? parsedData.skills.split(',').map((s: string) => s.trim()) : [],
        projects: Array.isArray(parsedData.projects) ? parsedData.projects.map((proj: any) => ({
          title: proj.title || proj.name || '',
          url: proj.url || proj.link || '',
          description: proj.description || '',
          technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : 
                       typeof proj.technologies === 'string' ? proj.technologies : ''
        })) : [],
        certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications.map((cert: any) => ({
          name: cert.name || cert.title || '',
          issuing_organization: cert.issuing_organization || cert.issuer || '',
          issue_date: cert.issue_date || cert.date || '',
          expiration_date: cert.expiration_date || cert.expires || ''
        })) : [],
        awards: Array.isArray(parsedData.awards) ? parsedData.awards.map((award: any) => ({
          title: award.title || award.name || '',
          issuer: award.issuer || award.organization || '',
          date_received: award.date_received || award.date || '',
          description: award.description || ''
        })) : [],
        languages: Array.isArray(parsedData.languages) ? parsedData.languages.map((lang: any) => ({
          name: typeof lang === 'string' ? lang : lang.name || lang.language || '',
          proficiency: typeof lang === 'object' ? lang.proficiency || lang.level || '' : ''
        })) : []
      };
    } catch (error) {
      console.error('Error parsing resume data:', error);
      return null;
    }
  }
}