// hooks/useWordDetails.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

interface Word {
  word_id: number;
  word: string;
  translation: string;
}

export const useWordDetails = (wordIds: number[]) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wordIds.length) return;

    const fetchWordDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_words_by_ids', {
            word_ids: wordIds
          });

        if (error) throw error;
        setWords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWordDetails();
  }, [wordIds]);

  return { words, loading, error };
};