import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseclient';

interface TopWord {
  word_id: number;
  word_root: string;
  translation: string;
  next_review_due_at: string;
}

export const useTopWords = () => {
  const [topWords, setTopWords] = useState<TopWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopWords = async () => {      
      try {
        const { data, error } = await supabase.rpc('get_top_words_by_due_date');

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
  }, []);

  return { topWords, isLoading, error };
};