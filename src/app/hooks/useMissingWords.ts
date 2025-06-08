import { useState, useEffect, useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import { createBrowserClient } from '@supabase/ssr';

interface MissingWord {
  id: number;
  content: string;
  translation: string;
}

interface MissingWordsRequest {
  language_code: string;
}

export const useMissingWords = (videoId: string) => {
  const [recommendedWords, setRecommendedWords] = useState<MissingWord[]>([]);
  const [flaggedWords, setFlaggedWords] = useState<MissingWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth, language } = useContext(UserContext);

  useEffect(() => {
    const fetchMissingWords = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        // Prepare the request body
        const requestBody: MissingWordsRequest = {
          language_code: language?.code || 'es' // Default to 'en' if language code is not available
        };

        const response = await fetchWithAuth(`${API_URL}/api/videos/${videoId}/missing-words`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch missing words');
        }

        const data = await response.json();
        const missingWordsData = data.missing_words;

        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: wordData, error: supabaseError } = await supabase
          .from('words')
          .select('id, root, translation, cognate')
          .in('id', missingWordsData.map((word: { id: number }) => word.id));

        if (supabaseError) {
          throw supabaseError;
        }

        const recommended: MissingWord[] = [];
        const flagged: MissingWord[] = [];

        wordData.forEach((word: { id: number; root: string; translation: string; cognate: string | null }) => {
          const base = {
            id: word.id,
            content: missingWordsData.find((w: { id: number }) => w.id === word.id)?.content || '',
            translation: word.translation,
          };

          if (word.cognate === 'invalid') {
            flagged.push(base);
          } else {
            recommended.push(base);
          }
        });

        setRecommendedWords(recommended);
        setFlaggedWords(flagged);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching missing words');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissingWords();
  }, [videoId, fetchWithAuth, language]);

  return { recommendedWords, flaggedWords, isLoading, error };
};