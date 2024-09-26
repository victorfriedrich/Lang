import { useState, useEffect, useContext } from 'react';
import { UserContext } from '@/context/UserContext';
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
  const { fetchWithAuth } = useContext(UserContext);

  useEffect(() => {
    const fetchMissingWords = async () => {
      try {
        const response = await fetchWithAuth(`http://127.0.0.1:8000/api/videos/${videoId}/missing-words`, {
          method: 'POST',
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
          .select('id, root, translation')
          .in('id', missingWordsData.map((word: { id: number }) => word.id));

        if (supabaseError) {
          throw supabaseError;
        }

        const words: MissingWord[] = wordData.map((word: { id: number; root: string; translation: string }) => ({
          id: word.id,
          content: missingWordsData.find((w: { id: number }) => w.id === word.id)?.content || '',
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
  }, [videoId, fetchWithAuth]);

  return { missingWords, isLoading, error };
};

