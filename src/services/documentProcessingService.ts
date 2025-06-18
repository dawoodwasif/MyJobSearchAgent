// Document Processing Service for AI Enhancement
export interface DocumentProcessingResponse {
  success: boolean;
  message: string;
  extractedText?: string;
  resumeData?: any;
  analysis?: {
    matchScore: number;
    summary: string;
    strengths: string[];
    gaps: string[];
    suggestions: string[];
    optimizedResumeUrl: string;
    optimizedCoverLetterUrl: string;
    keywordAnalysis: {
      coverageScore: number;
      coveredKeywords: string[];
      missingKeywords: string[];
    };
    experienceOptimization: Array<{
      company: string;
      position: string;
      relevanceScore: number;
      included: boolean;
      reasoning?: string;
    }>;
    skillsOptimization: {
      technicalSkills: string[];
      softSkills: string[];
      missingSkills: string[];
    };
    parsedResume?: any;
  };
  error?: string;
}

export class DocumentProcessingService {
  private static readonly API_BASE_URL = 'http://localhost:5000/api';

  // Check if backend is available
  static async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  // Extract text and generate optimized documents
  static async extractAndOptimize(
    file: File, 
    jobDescription: string
  ): Promise<DocumentProcessingResponse> {
    try {
      // Check if backend is available
      const isHealthy = await this.checkBackendHealth();
      if (!isHealthy) {
        throw new Error('Backend service is not available. Please ensure the Python backend is running on http://localhost:5000');
      }

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('job_description', jobDescription);

      // Make API call
      const response = await fetch(`${this.API_BASE_URL}/extract-and-optimize`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Document processing error:', error);
      return {
        success: false,
        message: 'Failed to process document',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Validate uploaded file
  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Only PDF and Word documents are allowed'
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

  // Download optimized resume
  static async downloadResume(fileId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/download/resume/${fileId}`);
      
      if (!response.ok) {
        throw new Error('Failed to download resume');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimized_resume_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume:', error);
      throw error;
    }
  }

  // Download optimized cover letter
  static async downloadCoverLetter(fileId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/download/cover-letter/${fileId}`);
      
      if (!response.ok) {
        throw new Error('Failed to download cover letter');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimized_cover_letter_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading cover letter:', error);
      throw error;
    }
  }

  // Extract file ID from URL
  static extractFileIdFromUrl(url: string): string | null {
    const match = url.match(/\/(?:resume|cover-letter)\/([^\/]+)$/);
    return match ? match[1] : null;
  }
}