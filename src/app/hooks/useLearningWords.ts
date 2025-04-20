// useLearningWords.ts
import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { UserContext } from '@/context/UserContext';

export interface LearningWord {
  word_id: number;
  word: string;
  translation: string;
  status: string;
  review_due: string; // "due today", "no review date", or a numeric string representing days
}

interface UseLearningWordsOptions {
  pageSize?: number;
  orderDirection?: 'ASC' | 'DESC';
  searchTerm?: string;
}

const useLearningWords = ({
  pageSize = 20,
  orderDirection = 'ASC',
  searchTerm = '',
}: UseLearningWordsOptions = {}) => {
  const [words, setWords] = useState<LearningWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useContext(UserContext);

  // Refs for pagination cursors (using review_due as the primary cursor)
  const lastFetchedReviewDueRef = useRef<number | null>(null);
  const lastFetchedWordIdRef = useRef<number | null>(null);

  // Maintain refs for loading and hasMore to avoid stale closures
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // Helper to convert the returned review_due text into a numeric value for pagination.
  const parseReviewDue = (reviewDue: string): number => {
    if (reviewDue === 'due today') return 0;
    if (reviewDue === 'no review date') return 10000;
    const parsed = parseInt(reviewDue, 10);
    return isNaN(parsed) ? 10000 : parsed;
  };

  const fetchWords = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.rpc('get_learning_words', {
        order_direction: orderDirection,
        cursor_days_due: lastFetchedReviewDueRef.current, // may be null on first fetch
        cursor_word_id: lastFetchedWordIdRef.current || 0, // tie-breaker, defaults to 0
        search_term: searchTerm,
        page_size: pageSize,
        language_filter: language?.name.toLowerCase(),
      });

      if (fetchError) {
        throw fetchError;
      }

      if (!data || data.length === 0) {
        setHasMore(false);
        return;
      }

      // Update pagination cursors using the last word in the fetched data.
      const lastWord = data[data.length - 1];
      const parsedReviewDue = parseReviewDue(lastWord.review_due);
      lastFetchedReviewDueRef.current = parsedReviewDue;
      lastFetchedWordIdRef.current = lastWord.word_id;

      setWords((prevWords) => {
        const existingIds = new Set(prevWords.map((word) => word.word_id));
        const newWords = data.filter((newWord: LearningWord) => !existingIds.has(newWord.word_id));
        return [...prevWords, ...newWords];
      });

      if (data.length < pageSize) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching learning words:', err);
      setError('Failed to fetch learning words.');
    } finally {
      setLoading(false);
    }
  }, [pageSize, orderDirection, searchTerm, language]);

  // When orderDirection or searchTerm change, reset the state and fetch the first page.
  useEffect(() => {
    setWords([]);
    lastFetchedReviewDueRef.current = null;
    lastFetchedWordIdRef.current = null;
    setHasMore(true);
    setError(null);
    fetchWords();
  }, [fetchWords, orderDirection, searchTerm]);

  return { words, fetchWords, loading, hasMore, error };
};

export default useLearningWords;
