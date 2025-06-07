import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

export interface LearningWord {
  word_id: number;
  word: string;
  translation: string;
  status: string;
  review_due: string;
  source: string;
}

export interface UseGetLearningWordsParams {
  orderDirection?: 'ASC' | 'DESC';
  cursorWordId?: number;
  searchTerm?: string | null;
  pageSize?: number;
  languageFilter?: string | null;
  sourceFilter?: string | null;
}

export const useGetLearningWords = ({
  orderDirection = 'ASC',
  cursorWordId = 0,
  searchTerm = null,
  pageSize = 20,
  languageFilter = null,
  sourceFilter = null,
}: UseGetLearningWordsParams) => {
  const [learningWords, setLearningWords] = useState<LearningWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLearningWords = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: rpcError } = await supabase
          .rpc('get_learning_words', {
            order_direction: orderDirection,
            cursor_word_id: cursorWordId,
            search_term: searchTerm,
            page_size: pageSize,
            language_filter: languageFilter,
            source_filter: sourceFilter,
          });

        if (rpcError) {
          console.error('Supabase RPC error:', rpcError);
          throw rpcError;
        }

        if (!Array.isArray(data)) {
          throw new Error('Unexpected response shape');
        }

        setLearningWords(data as LearningWord[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningWords();
  }, [
    orderDirection,
    cursorWordId,
    searchTerm,
    pageSize,
    languageFilter,
    sourceFilter,
  ]);

  return { learningWords, isLoading, error };
};
