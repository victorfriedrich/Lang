import { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { UserContext } from '@/context/UserContext';

interface OverdueWord {
  word_id: number;
  word_root: string;
  translation: string;
  next_review_due_at: string;
}

interface UseOverdueWordsOptions {
  dueType?: 'today' | 'overdue' | 'both';
  pageSize?: number;
}

export const useOverdueWords = (
  refreshTrigger: number,
  options: UseOverdueWordsOptions = {}
) => {
  const [overdueWords, setOverdueWords] = useState<OverdueWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useContext(UserContext);

  const {
    dueType = 'both',
    pageSize = 225,
  } = options;

  useEffect(() => {
    const fetchOverdueWords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc('get_overdue_words', {
          language_filter: language?.name.toLowerCase(),
          due_type: dueType,
          page_size: pageSize,
        });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        setOverdueWords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverdueWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, language, dueType, pageSize]);

  return { overdueWords, isLoading, error };
};