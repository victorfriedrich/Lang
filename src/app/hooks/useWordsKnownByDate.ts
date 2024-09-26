import { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { UserContext } from '../../context/UserContext';

interface WordsKnownData {
  date: string;
  words_known: number;
}

export const useWordsKnownByDate = () => {
  const { user } = useContext(UserContext);
  const [wordsKnownData, setWordsKnownData] = useState<WordsKnownData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchWordsKnownData();
    }
  }, [user]);

  const fetchWordsKnownData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('words_known_by_date');

      if (error) throw error;

      setWordsKnownData(data);
    } catch (err) {
      console.error('Error fetching words known by date:', err);
      setError('Failed to fetch words known by date');
    } finally {
      setIsLoading(false);
    }
  };

  return { wordsKnownData, isLoading, error };
};
