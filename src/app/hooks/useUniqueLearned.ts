import { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { UserContext } from '../../context/UserContext';

export const useUniqueLearned = () => {
  const [uniqueLearned, setUniqueLearned] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useContext(UserContext);

  useEffect(() => {
    const fetchUniqueLearned = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // If this site is reloaded language evaluates to null: Why?
        console.log("unique", language?.name)
        const { data, error } = await supabase.rpc('unique_learned', {
          p_language: language?.name.toLowerCase() ?? null
        });

        console.log(data)
        
        if (error) {
          throw new Error(error.message);
        }

        if (data !== null) {
          setUniqueLearned(data);
        } else {
          throw new Error('No data returned for unique words learned');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching unique words learned');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUniqueLearned();
  }, []);

  return { uniqueLearned, isLoading, error };
};
