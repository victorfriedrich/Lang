import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { UserContext } from '@/context/UserContext';

interface Word {
  word_id: number;
  word: string;
  translation: string;
  status: string;
}

interface UseUserWordsOptions {
  pageSize?: number;
  orderDirection?: 'ASC' | 'DESC';
  searchTerm?: string;
}

const useUserWords = ({
  pageSize = 20,
  orderDirection = 'ASC',
  searchTerm = '',
}: UseUserWordsOptions = {}) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useContext(UserContext)

  // Refs to store mutable values without causing re-renders
  const lastFetchedIdRef = useRef<number | null>(null);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);

  // Update refs whenever the state changes
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const fetchWords = useCallback(async () => {
    console.log(language?.name)
    // Prevent fetching if already loading or no more data
    if (loadingRef.current || !hasMoreRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.rpc('get_user_words_with_tests', {
        cursor_word_id: lastFetchedIdRef.current || 0,
        page_size: pageSize,
        order_direction: orderDirection,
        search_term: searchTerm,
        word_language: language?.name.toLowerCase()
      });

      console.log(data);

      if (fetchError) {
        throw fetchError;
      }

      if (!data || data.length === 0) {
        setHasMore(false);
        return;
      }

      // Determine if fewer items were returned than pageSize, indicating no more data
      if (data.length < pageSize) {
        setHasMore(false);
      }

      // Update the lastFetchedIdRef based on the order direction
      if (data.length > 0) {
        lastFetchedIdRef.current =
          orderDirection === 'ASC'
            ? data[data.length - 1].word_id
            : data[0].word_id;
      }

      setWords((prevWords) => {
        // Avoid duplicates by checking existing word_ids
        const existingWordIds = new Set(prevWords.map((word) => word.word_id));
        const filteredNewWords = data.filter((newWord: Word) => !existingWordIds.has(newWord.word_id));
        return [...prevWords, ...filteredNewWords];
      });
    } catch (err) {
      console.error('Error fetching words:', err);
      setError('Failed to fetch words.');
    } finally {
      setLoading(false);
    }
  }, [pageSize, orderDirection, searchTerm]);

  // Reset words when orderDirection or searchTerm changes
  useEffect(() => {
    // Reset state
    setWords([]);
    lastFetchedIdRef.current = null;
    setHasMore(true);
    setError(null);

    // Fetch the first page with new parameters
    fetchWords();
  }, [fetchWords, orderDirection, searchTerm]);

  return { words, fetchWords, loading, hasMore, error };
};

export default useUserWords;