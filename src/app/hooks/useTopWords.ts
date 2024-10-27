import { useState, useEffect, useContext } from 'react';
import { supabase } from '../../lib/supabaseclient';
import { UserContext } from '@/context/UserContext';

interface TopWord {
  word_id: number;
  word_root: string;
  translation: string;
  next_review_due_at: string;
}

export const useTopWords = (refreshTrigger: number) => {
  const [topWords, setTopWords] = useState<TopWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useContext(UserContext)

  useEffect(() => {
    const fetchTopWords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc('get_user_words', {
          language_filter: language?.name.toLowerCase()
        });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        setTopWords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopWords();
  }, [refreshTrigger]); // Add refreshTrigger to the dependency array

  return { topWords, isLoading, error };
};