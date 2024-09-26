import { useState } from 'react';
import { supabase } from '@/lib/supabaseclient';

export const useGetTranslationForWord = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getTranslationForWord = async (wordId: number) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .rpc('get_translation_for_word', { _word_id: wordId });

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getTranslationForWord, loading, error };
};