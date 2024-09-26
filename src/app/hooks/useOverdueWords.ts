import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

interface OverdueWord {
  word_id: number;
  word_root: string;
  translation: string;
  next_review_due_at: string;
}

export const useOverdueWords = (refreshTrigger: number) => {
  const [overdueWords, setOverdueWords] = useState<OverdueWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverdueWords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc('get_overdue_words');

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Function result:', data);

        setOverdueWords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverdueWords();
  }, [refreshTrigger]); // Add refreshTrigger to the dependency array

  return { overdueWords, isLoading, error };
};