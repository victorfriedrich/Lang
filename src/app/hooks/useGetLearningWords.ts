import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

interface LearningWord {
  word_id: number;
  status: 'learning' | 'unknown';
}

export const useGetLearningWords = (_word_ids: number[]) => {
  const [learningWords, setLearningWords] = useState<LearningWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLearningWords = async () => {
      try {
        const { data, error } = await supabase.rpc('get_learning_and_unknown_words', {
          _word_ids
        });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Function result:', data);

        setLearningWords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningWords();
  }, [_word_ids]);

  return { learningWords, isLoading, error };
};

