'use client';

import React, { useState, useRef, useContext } from 'react';
import { Upload, FileText, Package, ArrowLeft, AlertCircle } from 'lucide-react';
import { UserContext } from '@/context/UserContext';

const VocabularyImporter = ({ onBack, onComplete }) => {
  const [importSource, setImportSource] = useState(null); // 'anki', 'quizlet'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [importMethod, setImportMethod] = useState('file'); // 'file' or 'paste'
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // References for file inputs
  const fileInputRef = useRef(null);
  
  // Get context data
  const { fetchWithAuth, language } = useContext(UserContext);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Set the file and reset any errors
    setUploadedFile(file);
    setUploadError(null);
    
    // Upload immediately
    uploadFile(file);
  };
  
  // Upload the file with progress tracking
  const uploadFile = async (file) => {
    if (isUploading) return; // Prevent multiple uploads
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language?.code || 'es');
    formData.append('source', `${importSource}_upload`);
    
    try {
      // Get the auth token from context's fetchWithAuth
      const response = await fetchWithAuth(`${API_URL}/flashcards/upload`, {
        method: 'POST',
        body: formData,
      });
      
      // Check if the response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Error ${response.status}` }));
        throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
      }
      
      // Process successful response
      const data = await response.json();
      setIsUploading(false);
      setUploadProgress(100);
      onComplete && onComplete(data);
    } catch (error) {
      setIsUploading(false);
      setUploadError(error.message || 'Upload failed');
      setUploadProgress(0); // Reset progress on error
    }
  };
  
  // Upload pasted text
  const uploadPastedText = async (text) => {
    if (isUploading || !text) return; // Prevent multiple uploads or empty text
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create FormData
    const formData = new FormData();
    
    // Create a Blob from the text with proper MIME type
    const textBlob = new Blob([text], { type: 'text/csv' });
    
    // Append the blob as a file with .csv extension to ensure server validation passes
    formData.append('file', textBlob, 'pasted_text.csv');
    formData.append('language', language?.code || 'es');
    formData.append('source', `${importSource}_paste`);
    
    try {
      // Get the auth token from context's fetchWithAuth
      const response = await fetchWithAuth(`${API_URL}/flashcards/upload`, {
        method: 'POST',
        body: formData,
      });
      
      // Check if the response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Error ${response.status}` }));
        throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
      }
      
      // Process successful response
      const data = await response.json();
      setIsUploading(false);
      setUploadProgress(100);
      onComplete && onComplete(data);
    } catch (error) {
      setIsUploading(false);
      setUploadError(error.message || 'Upload failed');
      setUploadProgress(0); // Reset progress on error
    }
  };
  
  // Handle importing an option
  const handleImportSelection = (source) => {
    setImportSource(source);
  };
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setUploadError(null);
      uploadFile(file);
    }
  };
  
  // Main component render
  return (
    <div className="w-full bg-white min-h-screen">
      {/* Selection View */}
      {!importSource && (
        <>
          {/* Header */}
          <div className="px-6 pt-6 pb-5">
            <button 
              onClick={onBack}
              className="inline-flex items-center text-sm font-medium mb-4 hover:underline"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back
            </button>
            <h2 className="text-2xl font-semibold text-gray-900 leading-tight">Import vocabulary</h2>
            <p className="mt-2 text-base text-gray-500">Choose how you'd like to add new vocabulary to your collection</p>
          </div>
          
          {/* Import options */}
          <div className="px-6 pb-6">
            <div className="space-y-3">
              <button
                onClick={() => handleImportSelection('anki')}
                className="w-full flex items-start p-4 text-left bg-white border border-gray-200 rounded-xl hover:shadow-md transform hover:-translate-y-1 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <div className="flex-shrink-0 mr-4 mt-1 p-2 rounded-lg bg-blue-50">
                  <Package size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Import from Anki</h3>
                  <p className="mt-1 text-sm text-gray-500">Upload an Anki deck (.apkg)</p>
                </div>
              </button>
              
              <button
                onClick={() => handleImportSelection('quizlet')}
                className="w-full flex items-start p-4 text-left bg-white border border-gray-200 rounded-xl hover:shadow-md transform hover:-translate-y-1 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <div className="flex-shrink-0 mr-4 mt-1 p-2 rounded-lg bg-blue-50">
                  <FileText size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Import from Quizlet</h3>
                  <p className="mt-1 text-sm text-gray-500">Upload a Quizlet export (.csv, .txt)</p>
                </div>
              </button>
              
              {/* Camera option removed - will be implemented later */}
            </div>
          </div>
        </>
      )}
      
      {/* Import Process View */}
      {importSource && (
        <>
          {/* Header */}
          <div className={`px-6 pt-6 pb-5 bg-blue-50`}>
            <button 
              onClick={() => {
                setImportSource(null);
                setUploadedFile(null);
                setPastedText('');
                setImportMethod('file');
                setUploadProgress(0);
                setUploadError(null);
                setIsUploading(false);
              }}
              className="inline-flex items-center text-sm font-medium mb-4 hover:underline"
              disabled={isUploading}
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to import options
            </button>
            
            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center bg-white bg-opacity-50 rounded-lg">
                {importSource === 'anki' && <Package size={24} className="text-blue-600" />}
                {importSource === 'quizlet' && <FileText size={24} className="text-blue-600" />}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold mb-1">
                  {importSource === 'anki' && 'Import from Anki'}
                  {importSource === 'quizlet' && 'Import from Quizlet'}
                </h2>
                <p className="text-sm opacity-75">
                  {importSource === 'anki' && 'Upload your Anki deck file (.apkg)'}
                  {importSource === 'quizlet' && 'Upload your exported Quizlet file (.csv, .txt)'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-6">
            {/* Error display */}
            {uploadError && (
              <div className="mb-4 p-4 border border-red-200 rounded-md bg-red-50 text-red-700 flex items-start">
                <AlertCircle size={20} className="flex-shrink-0 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium">Upload failed</h3>
                  <p className="text-sm mt-1">{uploadError}</p>
                </div>
              </div>
            )}
            
            {uploadedFile ? (
              <div className="space-y-4">
                {isUploading && uploadProgress > 0 && (
                  <div className="w-full">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                
                {importMethod === 'file' ? (
                  <div 
                    onClick={() => !isUploading && fileInputRef.current && fileInputRef.current.click()}
                    onDragEnter={!isUploading ? handleDrag : null}
                    onDragLeave={!isUploading ? handleDrag : null}
                    onDragOver={!isUploading ? handleDrag : null}
                    onDrop={!isUploading ? handleDrop : null}
                    className={`border-2 border-dashed ${
                      isUploading 
                        ? 'border-gray-300 cursor-not-allowed opacity-70' 
                        : dragActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-blue-300 cursor-pointer'
                    } rounded-lg p-8 text-center transition-all duration-200`}
                  >
                    <div className={`mx-auto w-20 h-20 flex items-center justify-center ${dragActive && !isUploading ? 'bg-blue-100' : 'bg-gray-100'} rounded-full mb-4 transition-colors duration-200`}>
                      <Upload size={36} className={`${dragActive && !isUploading ? 'text-blue-500' : 'text-gray-500'} transition-colors duration-200`} />
                    </div>
                    <p className="text-gray-700 font-medium mb-2">Drag and drop your file here</p>
                    <p className="text-sm text-gray-500 mb-6">
                      or click to browse your files
                    </p>
                    <div className="flex space-x-3 justify-center">
                      <button 
                        className={`py-2 px-4 ${isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md inline-flex items-center`}
                        disabled={isUploading}
                      >
                        <Upload size={18} className="mr-2" />
                        Browse Files
                      </button>
                      {importSource === 'quizlet' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent file dialog from opening
                            setImportMethod('paste');
                          }}
                          className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md"
                          disabled={isUploading}
                        >
                          Paste Text
                        </button>
                      )}
                    </div>
                    <input 
                      type="file"
                      accept={importSource === 'anki' ? '.apkg' : '.csv,.txt'}
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                      <textarea
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        onPaste={(e) => {
                          // Wait for the paste event to complete and update the state
                          setTimeout(() => {
                            if (e.target.value || pastedText) {
                              uploadPastedText(e.target.value || pastedText);
                            }
                          }, 100);
                        }}
                        placeholder="Paste your exported data here"
                        className="w-full h-64 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        disabled={isUploading}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setImportMethod('file')}
                        className="py-2 px-4 text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Back to file upload
                      </button>
                    </div>
                    {isUploading && uploadProgress > 0 && (
                      <div className="w-full mt-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">How to import:</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {importSource === 'anki' && (
                      <>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          Use exported Anki packages (.apkg files)
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          Media embedded in cards will be imported as well
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          Tags and card formatting will be preserved
                        </li>
                      </>
                    )}
                    
                    {importSource === 'quizlet' && importMethod === 'file' && (
                      <>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          Export your Quizlet set as a CSV. If you're not the owner, you have to create a copy first.
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          Ensure terms and definitions are properly separated
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          Include any tags or categories if available
                        </li>
                      </>
                    )}
                    
                    {importSource === 'quizlet' && importMethod === 'paste' && (
                      <>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          Format: term,definition (one card per line)
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          Copy directly from your Quizlet set or spreadsheet
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          You can add tags by adding a third column: term,definition,tag
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default VocabularyImporter;