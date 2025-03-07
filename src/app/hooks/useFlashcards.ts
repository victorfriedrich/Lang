// hooks/useFlashcards.ts
import { useState, useContext } from 'react';
import { UserContext } from '@/context/UserContext';

interface IdentifiedWord {
  word: string;
  translation: string;
  id: number;
}

interface MissingWord {
  word: string;
  translation: string;
}

interface FlashcardsUploadResponse {
  identified: IdentifiedWord[];
  missing: MissingWord[];
}

export const useFlashcardsUpload = () => {
  const [uploadResponse, setUploadResponse] = useState<FlashcardsUploadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth } = useContext(UserContext);
  //const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const API_URL = 'http://localhost:8000';

  const uploadFlashcards = async (file: File, language: string, source: string = 'flashcards_upload') => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);
      formData.append('source', source);

      const response = await fetchWithAuth(`${API_URL}/flashcards/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data: FlashcardsUploadResponse = await response.json();
      setUploadResponse(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadFlashcards, uploadResponse, loading, error };
};

interface ProcessedWord {
  word: string;
  id: number;
}

interface ProcessMissingResponse {
  processed: ProcessedWord[];
}

export const useProcessMissingWords = () => {
  const [processedData, setProcessedData] = useState<ProcessMissingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth } = useContext(UserContext);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const processMissingWords = async (missing: MissingWord[], language: string, source: string = 'flashcards_upload') => {
    setLoading(true);
    setError(null);
    try {
      const payload = { missing, language, source };
      const response = await fetchWithAuth(`${API_URL}/flashcards/process-missing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Processing missing words failed');
      }
      const data: ProcessMissingResponse = await response.json();
      setProcessedData(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { processMissingWords, processedData, loading, error };
};
