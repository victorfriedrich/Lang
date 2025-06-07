import { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { UserContext } from '@/context/UserContext';

interface WordRow {
  word_id: number;
  word_root: string;
  translation: string;
  next_review_due_at: string;
}

interface UseWordsOptions {
  dueType?: 'today' | 'overdue' | 'both';
  pageSize?: number;
  source?: string;                     // NEW – optional filter
}

/**
 * Fetches words that are due/today/overdue for the current user.
 * Automatically re-runs when `refreshTrigger` or any option changes.
 */
export const useOverdueWords = (
  refreshTrigger: number,
  options: UseWordsOptions = {}
) => {
  const [words, setWords] = useState<WordRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language, loading: isLoadingUser } = useContext(UserContext);

  const {
    dueType = 'both',
    pageSize = 225,
    source,                           // may be undefined/null
  } = options;

  useEffect(() => {
    // Wait for user/language to finish loading
    if (isLoadingUser) {
      return;
    }

    // Stop if language isn't selected yet
    if (!language?.name) {
      setWords([]);
      setIsLoading(false);
      setError('No language selected');
      return;
    }

    const fetchWords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc('get_userwords_filtered', {
          language_filter: language.name.toLowerCase(),
          due_type: dueType,
          page_size: pageSize,
          // Only send p_source if the caller provided one.
          ...(source !== undefined && { p_source: source })
        });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        setWords(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, language, dueType, pageSize, source, isLoadingUser]);

  return { words, isLoading, error };
};
