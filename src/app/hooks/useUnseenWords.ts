import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

interface UnseenWord {
  word_id: number;
  root: string;
  translation: string;
}

export const useUnseenWords = () => {
  const [unseenWords, setUnseenWords] = useState<UnseenWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnseenWords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc('load_unseen_words');
        
        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          setUnseenWords(data as UnseenWord[]);
        } else {
          throw new Error('No unseen words data returned');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching unseen words');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnseenWords();
  }, []);

  return { unseenWords, isLoading, error };
};

