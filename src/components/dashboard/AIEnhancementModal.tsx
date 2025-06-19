import React, { useState } from 'react';
import { X, Upload, FileText, Sparkles, Cloud, HardDrive, AlertCircle, CheckCircle } from 'lucide-react';
import OptimizationResults from './OptimizationResults';
import { ResumeExtractionService } from '../../services/resumeExtractionService';

interface AIEnhancementModalProps {
  jobDescription: string;
  onSave: (resumeUrl: string, coverLetterUrl: string) => void;
  onClose: () => void;
}

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

      // Extract resume data using AI
      setExtractionProgress('Extracting resume data using AI...');
      const extractionResult = await ResumeExtractionService.extractResumeJson(fileToProcess, {
        modelType: 'OpenAI',
        model: 'gpt-4o',
        fileId: `ai_enhancement_${Date.now()}`
      });

      if (!extractionResult.success) {
        throw new Error(extractionResult.error || 'Failed to extract resume data');
      }

      setExtractionProgress('Processing extracted data...');
      
      // Parse the extracted resume data
      const parsedResumeData = ResumeExtractionService.parseResumeData(extractionResult.resume_json);
      
      if (!parsedResumeData) {
        throw new Error('Failed to parse extracted resume data');
      }

      setExtractionProgress('Generating AI optimization analysis...');

      // Generate mock optimization results with real extracted data
      const timestamp = Date.now();
      const enhancedResumeUrl = `https://example.com/ai-enhanced-resume-${timestamp}.pdf`;
      const enhancedCoverLetterUrl = `https://example.com/ai-enhanced-cover-letter-${timestamp}.pdf`;
      
      // Calculate match score based on extracted data
      const calculateMatchScore = (resumeData: any, jobDesc: string): number => {
        const jobKeywords = jobDesc.toLowerCase().split(/\s+/).filter(word => word.length > 3);
        const resumeText = JSON.stringify(resumeData).toLowerCase();
        const matchedKeywords = jobKeywords.filter(keyword => resumeText.includes(keyword));
        return Math.min(95, Math.max(60, Math.round((matchedKeywords.length / jobKeywords.length) * 100)));
      };

      const matchScore = calculateMatchScore(parsedResumeData, jobDescription);

      const mockResults = {
        matchScore,
        summary: `Your resume shows ${matchScore >= 80 ? 'excellent' : matchScore >= 70 ? 'good' : 'moderate'} alignment with this position. The AI has extracted ${extractionResult.extracted_text_length} characters of content and optimized it for better ATS compatibility and keyword matching.`,
        strengths: [
          `Strong ${parsedResumeData.experience?.length || 0} work experience entries with quantifiable achievements`,
          `Comprehensive skill set including ${parsedResumeData.skills?.slice(0, 3).join(', ')} and more`,
          `Educational background from ${parsedResumeData.education?.[0]?.school || 'recognized institution'}`,
          "Well-structured resume format suitable for ATS systems"
        ],
        gaps: [
          "Some industry-specific keywords could be emphasized more prominently",
          "Consider adding more quantified achievements with specific metrics",
          "Professional summary section could be enhanced for better impact"
        ],
        suggestions: [
          "Incorporate more action verbs and industry-specific terminology",
          "Add specific metrics and percentages to quantify your achievements",
          "Consider reorganizing sections to highlight most relevant experience first",
          "Include relevant certifications or training programs if applicable"
        ],
        optimizedResumeUrl: enhancedResumeUrl,
        optimizedCoverLetterUrl: enhancedCoverLetterUrl,
        keywordAnalysis: {
          coverageScore: matchScore,
          coveredKeywords: parsedResumeData.skills?.slice(0, 7) || ["JavaScript", "React", "Node.js", "Python", "Git"],
          missingKeywords: ["Docker", "Kubernetes", "CI/CD", "Microservices", "AWS"]
        },
        experienceOptimization: parsedResumeData.experience?.map((exp: any, index: number) => ({
          company: exp.company,
          position: exp.position,
          relevanceScore: Math.max(70, 95 - (index * 10)),
          included: index < 3, // Include top 3 most relevant
          reasoning: index >= 3 ? "Less relevant to target position" : undefined
        })) || [],
        skillsOptimization: {
          technicalSkills: parsedResumeData.skills?.filter((skill: string) => 
            ['javascript', 'react', 'python', 'node', 'sql', 'git', 'aws', 'docker'].some(tech => 
              skill.toLowerCase().includes(tech)
            )
          ).slice(0, 8) || [],
          softSkills: ["Leadership", "Problem Solving", "Communication", "Team Collaboration"],
          missingSkills: ["Docker", "Kubernetes", "GraphQL", "TypeScript"]
        },
        parsedResume: parsedResumeData,
        extractionMetadata: {
          extractedTextLength: extractionResult.extracted_text_length,
          processingTime: Date.now() - timestamp,
          modelUsed: 'gpt-4o'
        }
      };

      setOptimizationResults(mockResults);
      setShowResults(true);
      
    } catch (err: any) {
      console.error('AI Enhancement Error:', err);
      setError(err.message || 'Failed to generate AI-enhanced documents. Please try again.');
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Enhanced Resume & Cover Letter Generator
            </h2>
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
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {extractionProgress && (
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-lg text-sm flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              {extractionProgress}
            </div>
          )}

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

          {/* API Configuration Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={16} />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">API Configuration Required</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Make sure you have set the <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">VITE_OPENAI_API_KEY</code> environment variable 
                  for AI resume extraction to work properly.
                </p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={loading || (!selectedFile && !cloudFileUrl) || !jobDescription.trim()}
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