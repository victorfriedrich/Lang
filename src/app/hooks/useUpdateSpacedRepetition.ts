import { createBrowserClient } from '@supabase/ssr';
import { useCallback } from 'react';

export const useUpdateSpacedRepetition = () => {
  const updateSpacedRepetition = useCallback(async (testResult: boolean, userId: string, wordId: number) => {
    console.log('updateSpacedRepetition called with:', { testResult, userId, wordId });
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    try {
      console.log('Calling Supabase RPC: update_spaced_repetition');
      const { data, error } = await supabase.rpc('update_spaced_repetition', {
        _test_result: testResult,
        _user_id: userId,
        _word_id: wordId
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Spaced repetition updated successfully:', data);
      return data;
    } catch (err) {
      console.error('Error updating spaced repetition:', err);
      throw err;
    } finally {
      console.log('updateSpacedRepetition completed');
    }
  }, []);

  return { updateSpacedRepetition };
};