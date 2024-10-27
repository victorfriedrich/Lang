import { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { UserContext } from '@/context/UserContext';

export const useFetchTotalWordsKnown = () => {
  const [totalWordsKnown, setTotalWordsKnown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useContext(UserContext)

  useEffect(() => {
    const fetchTotalWordsKnown = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc('total_words_known', {
          language_filter: language?.name.toLowerCase()
        });
        
        if (error) {
          throw new Error(error.message);
        }

        if (data !== null) {
          setTotalWordsKnown(data);
        } else {
          throw new Error('No data returned for total words known');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching total words known');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalWordsKnown();
  }, []);

  return { totalWordsKnown, isLoading, error };
};
