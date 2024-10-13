import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseclient';

interface Word {
  word_id: number;
  word: string;
  translation: string;
  status: string;
}

const useUserWords = (pageSize = 10) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Using refs to store mutable values
  const lastFetchedIdRef = useRef<number | null>(null);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);

  // Update refs whenever the state changes
  useEffect(() => {
    lastFetchedIdRef.current = words.length > 0 ? words[words.length - 1].word_id : null;
  }, [words]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  // Remove this useEffect as we'll manage loadingRef directly
  // useEffect(() => {
  //   loadingRef.current = loading;
  // }, [loading]);

  const fetchWords = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    // **Immediately set loadingRef.current to true**
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_user_words_with_tests', {
        cursor_word_id: lastFetchedIdRef.current || 0,
        page_size: pageSize,
      });
      console.log(data);
      if (error) {
        throw error;
      }

      if (data.length < pageSize) {
        setHasMore(false);
      }

      setWords((prevWords) => [...prevWords, ...data] as Word[]);
    } catch (err) {
      console.error('Error fetching words:', err);
      setError('Failed to fetch words.');
    } finally {
      // **Set loadingRef.current to false before updating state**
      loadingRef.current = false;
      setLoading(false);
    }
  }, [pageSize]);

  // Initial fetch on mount
  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  return { words, fetchWords, loading, hasMore, error };
};

export default useUserWords;