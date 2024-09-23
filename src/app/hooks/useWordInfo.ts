import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface WordInfo {
  reviewcount: number;
  seencount: number;
  alternative_wordforms: string[];
}

export const useWordInfo = (userId: string, wordId: number) => {
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWordInfo = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        setError('Supabase configuration is missing');
        setIsLoading(false);
        return;
      }

      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      
      try {
        const { data, error } = await supabase.rpc('word_info', { _user_id: userId, _word_id: wordId });

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
  }, [userId]);

  return { wordInfo, isLoading, error };
};
