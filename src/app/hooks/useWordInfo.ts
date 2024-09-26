import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

interface WordInfo {
  reviewcount: number;
  seencount: number;
  alternative_wordforms: string[];
}

export const useWordInfo = (wordId: number) => {
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWordInfo = async () => {

      try {
        const { data, error } = await supabase.rpc('get_user_counts_with_wordforms', { _word_id: wordId });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (data && data.length > 0) {
          setWordInfo({
            reviewcount: data[0].reviewcount,
            seencount: data[0].seencount,
            alternative_wordforms: data[0].alternative_wordforms
          });
        } else {
          setWordInfo({ reviewcount: 0, seencount: 0, alternative_wordforms: [] });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching word info');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWordInfo();
    console.log(wordInfo);
  }, []);

  return { wordInfo, isLoading, error };
};
