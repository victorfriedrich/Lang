import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

export const useRecallEfficiency = () => {
  const [recallEfficiency, setRecallEfficiency] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecallEfficiency = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc('recall_efficiency_last_7_days');
        
        if (error) {
          throw new Error(error.message);
        }

        if (data !== null) {
          setRecallEfficiency(data);
        } else {
          throw new Error('No data returned for recall efficiency');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching recall efficiency');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecallEfficiency();
  }, []);

  return { recallEfficiency, isLoading, error };
};
