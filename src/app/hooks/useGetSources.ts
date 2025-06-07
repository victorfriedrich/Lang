// src/hooks/useGetSources.ts
import { supabase } from '@/lib/supabaseclient';
import { useCallback } from 'react';

export const useGetSources = () => {
  /**
   * Fetch all distinct sources for the authenticated user's words,
   * ordered by the earliest created_at timestamp.
   */
  const getSources = useCallback(async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase.rpc('get_userword_sources');

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }

      // data is an array of objects like [{ source: 'import' }, { source: 'daily_review' }, ...]
      return (data ?? []).map((row: { source: string }) => row.source);
    } catch (err) {
      console.error('Error fetching userword sources:', err);
      throw err;
    }
  }, []);

  return { getSources };
};
