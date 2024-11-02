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
  const { language, isLoading: isLoadingUser } = useContext(UserContext);

  useEffect(() => {
    // Don't fetch if user/language is still loading
    if (isLoadingUser) {
      return;
    }

    // Don't fetch if language is not available
    if (!language?.name) {
      setTopWords([]);
      setIsLoading(false);
      setError('No language selected');
      return;
    }

    const fetchTopWords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc('get_user_words', {
          language_filter: language.name.toLowerCase()
        });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        setTopWords(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setTopWords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopWords();
  }, [refreshTrigger, language, isLoadingUser]);

  return { 
    topWords, 
    isLoading: isLoading || isLoadingUser,
    error,
    isInitialized: !isLoadingUser && language?.name != null 
  };
};