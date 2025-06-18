import React, { useState } from 'react';
import { X, Upload, FileText, Sparkles, Cloud, HardDrive, AlertTriangle, CheckCircle } from 'lucide-react';
import OptimizationResults from './OptimizationResults';
import { DocumentProcessingService } from '../../services/documentProcessingService';

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
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  // Check backend status on component mount
  React.useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    const isAvailable = await DocumentProcessingService.checkBackendHealth();
    setBackendStatus(isAvailable ? 'available' : 'unavailable');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = DocumentProcessingService.validateFile(file);
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

  const handleGenerateAI = async () => {
    if (!selectedFile && !cloudFileUrl) {
      setError('Please select a resume file or provide a cloud file URL');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Job description is required for AI enhancement');
      return;
    }

    if (backendStatus !== 'available') {
      setError('Backend service is not available. Please ensure the Python backend is running.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let fileToProcess = selectedFile;

      // If cloud URL is provided, we need to fetch the file first
      if (cloudFileUrl && !selectedFile) {
        setError('Cloud file processing is not yet implemented. Please upload a local file.');
        setLoading(false);
        return;
      }

      if (!fileToProcess) {
        throw new Error('No file to process');
      }

      // Call the backend API
      const response = await DocumentProcessingService.extractAndOptimize(
        fileToProcess,
        jobDescription
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to process document');
      }

      // Set the optimization results
      setOptimizationResults(response.analysis);
      setShowResults(true);
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI-enhanced documents. Please try again.');
    } finally {
      setLoading(false);
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
          {/* Backend Status Indicator */}
          <div className={`p-3 rounded-lg border ${
            backendStatus === 'available' 
              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
              : backendStatus === 'unavailable'
              ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
              : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700'
          }`}>
            <div className="flex items-center gap-2">
              {backendStatus === 'available' && <CheckCircle className="text-green-600 dark:text-green-400" size={16} />}
              {backendStatus === 'unavailable' && <AlertTriangle className="text-red-600 dark:text-red-400" size={16} />}
              {backendStatus === 'checking' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>}
              
              <span className={`text-sm font-medium ${
                backendStatus === 'available' 
                  ? 'text-green-700 dark:text-green-400'
                  : backendStatus === 'unavailable'
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-yellow-700 dark:text-yellow-400'
              }`}>
                {backendStatus === 'available' && 'Backend service is running'}
                {backendStatus === 'unavailable' && 'Backend service is not available'}
                {backendStatus === 'checking' && 'Checking backend status...'}
              </span>
              
              {backendStatus === 'unavailable' && (
                <button
                  onClick={checkBackendStatus}
                  className="ml-auto text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
            
            {backendStatus === 'unavailable' && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Please start the Python backend server: <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">cd backend && python app.py</code>
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
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
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Select PDF or Word document (max 10MB)
                  </p>
                  {selectedFile && (
                    <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
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
                  <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                    Note: Cloud file processing is not yet implemented. Please upload a local file.
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
              disabled={loading || (!selectedFile && !cloudFileUrl) || !jobDescription.trim() || backendStatus !== 'available'}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing Document...
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