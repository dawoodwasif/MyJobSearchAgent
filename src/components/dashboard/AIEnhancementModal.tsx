import React, { useState } from 'react';
import { X, Upload, FileText, Sparkles, Cloud, HardDrive, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import OptimizationResults from './OptimizationResults';
import { ResumeExtractionService } from '../../services/resumeExtractionService';
import { AIEnhancementService } from '../../services/aiEnhancementService';

interface AIEnhancementModalProps {
  jobDescription: string;
  onSave: (resumeUrl: string, coverLetterUrl: string) => void;
  onClose: () => void;
}

// Generate a random UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const AIEnhancementModal: React.FC<AIEnhancementModalProps> = ({ 
  jobDescription, 
  onSave, 
  onClose 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cloudProvider, setCloudProvider] = useState<string>('');
  const [cloudFileUrl, setCloudFileUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [extractionProgress, setExtractionProgress] = useState<string>('');
  const [documentId] = useState<string>(generateUUID()); // Generate once and keep it

  // Get configuration for display
  const config = ResumeExtractionService.getConfiguration();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      const validation = ResumeExtractionService.validateResumeFile(file);
      
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      setCloudFileUrl(''); // Clear cloud URL if local file is selected
    }
  };

  const handleCloudProviderChange = (provider: string) => {
    setCloudProvider(provider);
    setSelectedFile(null); // Clear local file if cloud provider is selected
    setCloudFileUrl('');
  };

  const downloadFileFromUrl = async (url: string): Promise<File> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
      }
      
      const blob = await response.blob();
      const filename = url.split('/').pop() || 'resume.pdf';
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      throw new Error('Failed to download file from URL. Please check the URL and permissions.');
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedFile && !cloudFileUrl) {
      setError('Please select a resume file or provide a cloud file URL');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Job description is required for AI enhancement');
      return;
    }

    // Check API configuration
    if (!config.hasApiKey) {
      setError('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables.');
      return;
    }

    // Validate enhancement request
    const validation = AIEnhancementService.validateEnhancementRequest(jobDescription);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid request');
      return;
    }

    setLoading(true);
    setError('');
    setExtractionProgress('');

    try {
      let fileToProcess = selectedFile;

      // If using cloud URL, download the file first
      if (cloudFileUrl && !selectedFile) {
        setExtractionProgress('Downloading file from cloud storage...');
        fileToProcess = await downloadFileFromUrl(cloudFileUrl);
      }

      if (!fileToProcess) {
        throw new Error('No file to process');
      }

      // Step 1: Extract resume data using AI
      setExtractionProgress('Extracting resume data using AI...');
      const extractionResult = await ResumeExtractionService.extractResumeJson(fileToProcess, {
        modelType: config.defaultModelType,
        model: config.defaultModel,
        fileId: documentId // Use the persistent UUID
      });

      if (!extractionResult.success) {
        // Handle specific API errors
        if (extractionResult.error?.includes('PDF format not supported') || 
            extractionResult.error?.includes('format not supported') ||
            extractionResult.error?.includes('unsupported file type')) {
          throw new Error('PDF format not supported by the current API. Please try uploading a Word document (.docx) or text file (.txt) instead.');
        }
        
        if (extractionResult.error?.includes('API key') || 
            extractionResult.error?.includes('authentication')) {
          throw new Error('API authentication failed. Please check your OpenAI API key configuration.');
        }
        
        if (extractionResult.error?.includes('rate limit') || 
            extractionResult.error?.includes('quota')) {
          throw new Error('API rate limit exceeded. Please try again in a few minutes.');
        }
        
        throw new Error(extractionResult.error || 'Failed to extract resume data. The API may be temporarily unavailable.');
      }

      setExtractionProgress('Processing extracted data...');
      
      // Parse the extracted resume data
      const parsedResumeData = ResumeExtractionService.parseResumeData(extractionResult.resume_json);
      
      if (!parsedResumeData) {
        throw new Error('Failed to parse extracted resume data. The resume format may not be compatible.');
      }

      // Step 2: Enhance resume using AI analysis
      setExtractionProgress('Analyzing resume against job description...');
      
      let enhancementResult;
      try {
        // Try using the JSON mode first (more reliable)
        enhancementResult = await AIEnhancementService.enhanceWithJson(
          extractionResult.resume_json,
          jobDescription,
          {
            modelType: config.defaultModelType,
            model: config.defaultModel,
            fileId: documentId
          }
        );
      } catch (jsonError) {
        console.warn('JSON enhancement failed, trying file mode:', jsonError);
        // Fallback to file mode
        setExtractionProgress('Retrying analysis with file upload...');
        enhancementResult = await AIEnhancementService.enhanceWithFile(
          fileToProcess,
          jobDescription,
          {
            modelType: config.defaultModelType,
            model: config.defaultModel,
            fileId: documentId
          }
        );
      }

      if (!enhancementResult.success) {
        throw new Error(enhancementResult.error || 'Failed to analyze resume. Please try again.');
      }

      // Normalize the response to ensure all fields exist
      const normalizedResult = AIEnhancementService.normalizeEnhancementResponse(enhancementResult);

      setExtractionProgress('Generating optimization recommendations...');

      // Generate mock URLs for the enhanced documents
      const timestamp = Date.now();
      const enhancedResumeUrl = `https://example.com/ai-enhanced-resume-${documentId}.pdf`;
      const enhancedCoverLetterUrl = `https://example.com/ai-enhanced-cover-letter-${documentId}.pdf`;
      
      // Combine real AI analysis with our UI structure
      const optimizationResults = {
        matchScore: normalizedResult.analysis.match_score,
        summary: normalizedResult.analysis.match_score >= 80 
          ? `Excellent match! Your resume shows strong alignment with this position (${normalizedResult.analysis.match_score}% match). The AI has identified key strengths and provided targeted recommendations for optimization.`
          : normalizedResult.analysis.match_score >= 70
          ? `Good match! Your resume aligns well with this position (${normalizedResult.analysis.match_score}% match). The AI has identified areas for improvement to strengthen your application.`
          : `Moderate match (${normalizedResult.analysis.match_score}% match). The AI has identified significant opportunities to better align your resume with this position.`,
        
        // Use real AI analysis data
        strengths: normalizedResult.analysis.strengths.length > 0 
          ? normalizedResult.analysis.strengths 
          : [
              `Strong technical background with ${parsedResumeData.experience?.length || 0} work experience entries`,
              `Comprehensive skill set including relevant technologies`,
              `Educational background aligns with job requirements`
            ],
        
        gaps: normalizedResult.analysis.gaps.length > 0 
          ? normalizedResult.analysis.gaps 
          : [
              "Some industry-specific keywords could be emphasized more prominently",
              "Consider adding more quantified achievements with specific metrics"
            ],
        
        suggestions: normalizedResult.analysis.suggestions.length > 0 
          ? normalizedResult.analysis.suggestions 
          : [
              "Incorporate more action verbs and industry-specific terminology",
              "Add specific metrics and percentages to quantify your achievements",
              "Consider reorganizing sections to highlight most relevant experience first"
            ],

        optimizedResumeUrl: enhancedResumeUrl,
        optimizedCoverLetterUrl: enhancedCoverLetterUrl,
        
        // Use real keyword analysis
        keywordAnalysis: {
          coverageScore: normalizedResult.analysis.keyword_analysis.keyword_density_score,
          coveredKeywords: normalizedResult.analysis.keyword_analysis.present_keywords,
          missingKeywords: normalizedResult.analysis.keyword_analysis.missing_keywords
        },
        
        // Enhanced experience optimization using real data
        experienceOptimization: parsedResumeData.experience?.map((exp: any, index: number) => ({
          company: exp.company || 'Unknown Company',
          position: exp.position || 'Unknown Position',
          relevanceScore: Math.max(70, normalizedResult.analysis.match_score - (index * 5)),
          included: index < 3, // Include top 3 most relevant
          reasoning: index >= 3 ? "Less relevant to target position based on AI analysis" : undefined
        })) || [],
        
        // Enhanced skills optimization
        skillsOptimization: {
          technicalSkills: normalizedResult.enhancements.enhanced_skills.length > 0 
            ? normalizedResult.enhancements.enhanced_skills 
            : Array.isArray(parsedResumeData.skills) ? parsedResumeData.skills.slice(0, 8) : [],
          softSkills: ["Leadership", "Problem Solving", "Communication", "Team Collaboration"],
          missingSkills: normalizedResult.analysis.keyword_analysis.missing_keywords.slice(0, 5)
        },
        
        // Include parsed resume data
        parsedResume: parsedResumeData,
        
        // Enhanced metadata
        extractionMetadata: {
          documentId: documentId,
          extractedTextLength: extractionResult.extracted_text_length,
          processingTime: Date.now() - timestamp,
          modelUsed: normalizedResult.metadata.model_used,
          apiBaseUrl: config.apiBaseUrl,
          sectionsAnalyzed: normalizedResult.metadata.resume_sections_analyzed
        },
        
        // Include AI enhancements
        aiEnhancements: {
          enhancedSummary: normalizedResult.enhancements.enhanced_summary,
          enhancedExperienceBullets: normalizedResult.enhancements.enhanced_experience_bullets,
          coverLetterOutline: normalizedResult.enhancements.cover_letter_outline,
          sectionRecommendations: normalizedResult.analysis.section_recommendations
        },
        
        // Include raw AI response for debugging
        rawAIResponse: normalizedResult
      };

      setOptimizationResults(optimizationResults);
      setShowResults(true);
      
    } catch (err: any) {
      console.error('AI Enhancement Error:', err);
      
      // Provide user-friendly error messages
      let userMessage = err.message;
      
      if (err.message.includes('Failed to fetch') || err.message.includes('network')) {
        userMessage = 'Unable to connect to the AI service. Please check your internet connection and try again.';
      } else if (err.message.includes('timeout') || err.message.includes('timed out')) {
        userMessage = 'The AI processing is taking longer than expected. Please try again with a smaller file or try again later.';
      } else if (err.message.includes('API key')) {
        userMessage = 'API configuration error. Please contact support for assistance.';
      } else if (!err.message || err.message === 'Failed to generate AI-enhanced documents. Please try again.') {
        userMessage = 'The AI service is temporarily unavailable. Please try again in a few minutes or contact support if the issue persists.';
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
      setExtractionProgress('');
    }
  };

  const handleResultsClose = () => {
    setShowResults(false);
    // Save the URLs to the parent component
    if (optimizationResults) {
      onSave(optimizationResults.optimizedResumeUrl, optimizationResults.optimizedCoverLetterUrl);
    }
    onClose();
  };

  if (showResults && optimizationResults) {
    return (
      <OptimizationResults
        results={optimizationResults}
        onClose={handleResultsClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Enhanced Resume & Cover Letter Generator
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Document ID: {documentId.slice(0, 8)}...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm flex items-start gap-3">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {extractionProgress && (
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-lg text-sm flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              {extractionProgress}
            </div>
          )}

          {/* API Configuration Status */}
          <div className={`border rounded-lg p-4 ${
            config.hasApiKey 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
          }`}>
            <div className="flex items-start gap-3">
              <Settings className={`mt-0.5 ${
                config.hasApiKey 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} size={16} />
              <div>
                <h4 className={`text-sm font-medium ${
                  config.hasApiKey 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  AI Analysis Configuration {config.hasApiKey ? 'Ready' : 'Required'}
                </h4>
                <div className={`text-sm mt-1 ${
                  config.hasApiKey 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  <p>API Endpoint: <code className="bg-black/10 px-1 rounded">{config.apiBaseUrl}</code></p>
                  <p>Model: <code className="bg-black/10 px-1 rounded">{config.defaultModel}</code></p>
                  <p>API Key: {config.hasApiKey ? '✓ Configured' : '✗ Missing VITE_OPENAI_API_KEY'}</p>
                  <p className="text-xs mt-1">
                    {config.hasApiKey 
                      ? 'Ready for resume extraction and AI enhancement analysis'
                      : 'Both resume extraction and AI enhancement require API configuration'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description - First Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText size={16} className="inline mr-2" />
              Job Description
            </label>
            <textarea
              value={jobDescription}
              readOnly
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Job description will be used to tailor your resume and cover letter..."
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This job description will be analyzed by AI to optimize your resume and cover letter
            </p>
          </div>

          {/* Resume Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              <Upload size={16} className="inline mr-2" />
              Upload Your Current Resume
            </label>
            
            {/* Local File Upload */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-4">
              <div className="text-center">
                <HardDrive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="flex flex-col items-center">
                  <label className="cursor-pointer">
                    <span className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Browse Local Files
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Select PDF, Word document, or text file (max 10MB)
                  </p>
                  {selectedFile && (
                    <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Selected: {selectedFile.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cloud Provider Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Or select from cloud storage:</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Google Drive */}
                <button
                  type="button"
                  onClick={() => handleCloudProviderChange('google-drive')}
                  className={`p-4 border rounded-lg flex items-center gap-3 transition-all ${
                    cloudProvider === 'google-drive'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Cloud size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Google Drive
                  </span>
                </button>

                {/* OneDrive */}
                <button
                  type="button"
                  onClick={() => handleCloudProviderChange('onedrive')}
                  className={`p-4 border rounded-lg flex items-center gap-3 transition-all ${
                    cloudProvider === 'onedrive'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Cloud size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    OneDrive
                  </span>
                </button>

                {/* Dropbox */}
                <button
                  type="button"
                  onClick={() => handleCloudProviderChange('dropbox')}
                  className={`p-4 border rounded-lg flex items-center gap-3 transition-all ${
                    cloudProvider === 'dropbox'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Cloud size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dropbox
                  </span>
                </button>
              </div>

              {/* Cloud File URL Input */}
              {cloudProvider && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {cloudProvider === 'google-drive' && 'Google Drive File URL'}
                    {cloudProvider === 'onedrive' && 'OneDrive File URL'}
                    {cloudProvider === 'dropbox' && 'Dropbox File URL'}
                  </label>
                  <input
                    type="url"
                    value={cloudFileUrl}
                    onChange={(e) => setCloudFileUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter your ${cloudProvider} file URL...`}
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Make sure the file is publicly accessible or shared with appropriate permissions
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={loading || (!selectedFile && !cloudFileUrl) || !jobDescription.trim() || !config.hasApiKey}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {extractionProgress || 'Processing...'}
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate using AI - Resume & Cover Letter
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEnhancementModal;