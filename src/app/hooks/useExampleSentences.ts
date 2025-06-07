import { useState, useContext } from 'react';
import { UserContext } from '@/context/UserContext';

export interface ExampleEntry {
  sentences: string[];
  highlights: string[];
}

export const useExampleSentences = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth, language } = useContext(UserContext);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchExamples = async (words: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${API_URL}/api/example-sentences`, {
        method: 'POST',
        body: JSON.stringify({
          words,
          language: language?.code || 'es',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch example sentences');
      }
      const data: Record<string, ExampleEntry> = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchExamples, loading, error };
};
