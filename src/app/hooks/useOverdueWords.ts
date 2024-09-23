import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface OverdueWord {
  word_id: number;
  word_root: string;
  translation: string;
  next_review_due_at: string;
}

export const useOverdueWords = () => {
  const [overdueWords, setOverdueWords] = useState<OverdueWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverdueWords = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      
      try {
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .rpc('get_overdue_words', { _user_id: '529cf561-a58a-4e90-9148-5e9b0f8c49e1' });

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
  }, []);

  return { overdueWords, isLoading, error };
};