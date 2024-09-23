import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface MissingWord {
  id: number;
  content: string;
  translation: string;
}

export const useMissingWords = (videoId: string) => {
  const [missingWords, setMissingWords] = useState<MissingWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissingWords = async () => {
      try {
        // Fetch missing words from the FastAPI endpoint
        const response = await fetch(`http://127.0.0.1:8000/api/videos/${videoId}/missing-words`, {
          method: 'POST',
        });
        console.log(response)
        if (!response.ok) {
          throw new Error('Failed to fetch missing words');
        }

        const data = await response.json();
        const missingWordsData = data.missing_words;

        // Filter out any missing words with invalid IDs
        const validMissingWordsData = missingWordsData.filter((word: { id: number | null }) => word.id !== null);

        // Fetch translations from Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          setError('Supabase configuration is missing');
          setIsLoading(false);
          return;
        }

        const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

        const { data: wordData, error: supabaseError } = await supabase
          .from('words')
          .select('id, root, translation')
          .in('id', validMissingWordsData.map((word: { id: number }) => word.id));

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          throw supabaseError;
        }

        const words: MissingWord[] = wordData.map((word: { id: number; root: string; translation: string }) => ({
          id: word.id,
          content: validMissingWordsData.find((w: { id: number }) => w.id === word.id)?.content || '',
          translation: word.translation,
        }));

        setMissingWords(words);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching missing words');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissingWords();
  }, [videoId]);

  return { missingWords, isLoading, error };
};

