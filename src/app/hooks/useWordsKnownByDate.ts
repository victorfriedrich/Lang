import { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { UserContext } from '../../context/UserContext';

interface WordsKnownData {
  date: string;
  words_known: number;
}

export const useWordsKnownByDate = () => {
  const { user, language } = useContext(UserContext);
  const [wordsKnownData, setWordsKnownData] = useState<WordsKnownData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch when both user and language are available
    if (user && language?.name) {
      fetchWordsKnownData();
    }
  }, [user, language]);

  const fetchWordsKnownData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Safely derive the language filter, with a fallback if needed
      const langFilter = language?.name.toLowerCase() ?? '';
      const { data, error: rpcError } = await supabase.rpc(
        'words_known_by_date',
        { language_filter: langFilter }
      );

      if (rpcError) throw rpcError;

      setWordsKnownData(data as WordsKnownData[]);
    } catch (err) {
      console.error('Error fetching words known by date:', err);
      setError('Failed to fetch words known by date');
    } finally {
      setIsLoading(false);
    }
  };

  return { wordsKnownData, isLoading, error };
};
