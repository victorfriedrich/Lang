'use client';

import React, { useState, useRef, useContext } from 'react';
import { Upload, Camera, FileText, Package, ArrowLeft, AlertCircle } from 'lucide-react';
import { UserContext } from '@/context/UserContext';

const VocabularyImporter = ({ onBack, onComplete }) => {
  const [importSource, setImportSource] = useState(null); // 'anki', 'quizlet', 'camera'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // References for file inputs
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
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
  
  // Handle camera capture
  const handleCameraCapture = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Create URL for preview
    const imageUrl = URL.createObjectURL(file);
    setCapturedImage(imageUrl);
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
              
              <button
                onClick={() => handleImportSelection('camera')}
                className="w-full flex items-start p-4 text-left bg-white border border-gray-200 rounded-xl hover:shadow-md transform hover:-translate-y-1 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <div className="flex-shrink-0 mr-4 mt-1 p-2 rounded-lg bg-blue-50">
                  <Camera size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Take a photo</h3>
                  <p className="mt-1 text-sm text-gray-500">Capture vocabulary from printed material</p>
                </div>
              </button>
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
                setCapturedImage(null);
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
                {importSource === 'camera' && <Camera size={24} className="text-blue-600" />}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold mb-1">
                  {importSource === 'anki' && 'Import from Anki'}
                  {importSource === 'quizlet' && 'Import from Quizlet'}
                  {importSource === 'camera' && 'Capture from Textbook'}
                </h2>
                <p className="text-sm opacity-75">
                  {importSource === 'anki' && 'Upload your Anki deck file (.apkg)'}
                  {importSource === 'quizlet' && 'Upload your exported Quizlet file (.csv, .txt)'}
                  {importSource === 'camera' && 'Take a clear photo of your vocabulary list'}
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
            
            {capturedImage ? (
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
            ) : uploadedFile ? (
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
                {importSource === 'camera' ? (
                  <div 
                    onClick={() => !isUploading && cameraInputRef.current && cameraInputRef.current.click()}
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${isUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-blue-300'} transition-colors`}
                  >
                    <div className="mx-auto w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                      <Camera size={36} className="text-gray-500" />
                    </div>
                    <p className="text-gray-700 font-medium mb-2">Take a picture of your textbook</p>
                    <p className="text-sm text-gray-500 mb-6">
                      Position your camera to capture the vocabulary clearly
                    </p>
                    <button 
                      className={`py-2 px-4 ${isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md inline-flex items-center`}
                      disabled={isUploading}
                    >
                      <Camera size={18} className="mr-2" />
                      Open Camera
                    </button>
                    <input 
                      type="file"
                      accept="image/*"
                      ref={cameraInputRef}
                      onChange={handleCameraCapture}
                      className="hidden" 
                      capture="environment"
                      disabled={isUploading}
                    />
                  </div>
                ) : (
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
                    <button 
                      className={`py-2 px-4 ${isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md inline-flex items-center`}
                      disabled={isUploading}
                    >
                      <Upload size={18} className="mr-2" />
                      Browse Files
                    </button>
                    <input 
                      type="file"
                      accept={importSource === 'anki' ? '.apkg' : '.csv,.txt'}
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tips for best results:</h3>
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
                    
                    {importSource === 'quizlet' && (
                      <>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          Export your Quizlet set as a CSV or text file
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
                    
                    {importSource === 'camera' && (
                      <>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          Ensure good lighting and clear focus
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          Keep the page flat and avoid shadows
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          Capture only the vocabulary section
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