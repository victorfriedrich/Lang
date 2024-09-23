import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface StreakData {
  revision_date: string;
  revision_count: number;
}

export const useStreakData = (userId: string) => {
  const [streakData, setStreakData] = useState<StreakData[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStreakData(userId);
  }, [userId]);

  const fetchStreakData = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.rpc('get_streak_data', { _user_id: userId });

      if (error) throw error;

      const processedData = processStreakData(data);

      console.log(processedData)
      setStreakData(processedData);
      setCurrentStreak(calculateCurrentStreak(processedData));
      setHighestStreak(10); // Mock value, replace with actual logic
    } catch (err) {
      console.error('Error fetching streak data:', err);
      setError('Failed to fetch streak data');
    } finally {
      setIsLoading(false);
    }
  };

  return { streakData, currentStreak, highestStreak, isLoading, error };
};

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

function processStreakData(data: StreakData[]): StreakData[] {
  const today = new Date().toISOString().split('T')[0];
  const lastDate = data[data.length - 1]?.revision_date;

  return lastDate !== today
    ? [...data, { revision_date: today, revision_count: 0 }]
    : data;
}

function calculateCurrentStreak(data: StreakData[]): number {
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];

  for (let i = data.length - 1; i >= 0; i--) {
    const date = new Date(data[i].revision_date);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - (data.length - 1 - i));

    if (date.toISOString().split('T')[0] !== expectedDate.toISOString().split('T')[0]) break;

    if (data[i].revision_count > 0 || i === data.length - 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}