'use client';

import { useState } from 'react';
import { useFlashcardsUpload } from '../hooks/useFlashcards';
import VocabularyImporter from '../components/FlashcardImporter';
import FlashcardImport from '../components/FlashcardImport';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const [uploadResponse, setUploadResponse] = useState(null);
  const { uploadFlashcards, loading, error } = useFlashcardsUpload();
  const router = useRouter();
  
  // Handle file upload completion
  const handleUploadComplete = (data) => {
    console.log('Upload complete:', data);
    setUploadResponse(data);
  };
  
  // Handle going back from the confirmation screen
  const handleImportCancel = () => {
    setUploadResponse(null);
  };
  
  // Handle adding selected flashcards to practice
  const handleAddToPractice = (selectedWords) => {
    console.log('Adding words to practice:', selectedWords);
    // Save the selected words or navigate to another page
    // For example:
    // router.push('/practice');
  };
  
  // Determine which view to show
  const showConfirmation = uploadResponse !== null;
  
  return (
    <div className="min-h-screen">
      {showConfirmation ? (
        // Show the confirmation screen if we have upload data
        <FlashcardImport 
          data={uploadResponse}
          onCancel={handleImportCancel}
          onComplete={handleAddToPractice}
        />
      ) : (
        // Show the importer if we don't have data yet
        <VocabularyImporter 
          onBack={() => router.push('/progress')}
          onComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}