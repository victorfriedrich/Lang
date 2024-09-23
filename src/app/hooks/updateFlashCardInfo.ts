import { createBrowserClient } from '@supabase/ssr';

interface FlashcardTestParams {
  userId: string;
  wordId: number;
  testType: 'flashcard' | 'typing';
  testResult: boolean;
}

export const useUpdateFlashCardInfo = () => {
  const updateFlashCardInfo = async ({
    userId,
    wordId,
    testType,
    testResult,
  }: FlashcardTestParams) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL or Anon Key is missing');
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    try {
      const { data, error } = await supabase.rpc('insert_flashcard_test', {
        _user_id: userId,
        _word_id: wordId,
        _test_type: testType,
        _test_result: testResult,
      });

      if (error) {
        console.error('Error updating flashcard info:', error);
        throw error;
      } else {
        console.log('Flashcard info updated successfully:', data);
      }

      // Update spaced repetition
      const { data: spacedRepData, error: spacedRepError } = await supabase.rpc('update_spaced_repetition', {
        _test_result: testResult,
        _user_id: userId,
        _word_id: wordId
      });

      if (spacedRepError) {
        console.error('Error updating spaced repetition:', spacedRepError);
      } else {
        console.log('Spaced repetition updated successfully:', spacedRepData);
      }

    } catch (err) {
      console.error('Unexpected error:', err);
      throw err;
    }
  };

  return { updateFlashCardInfo };
};


