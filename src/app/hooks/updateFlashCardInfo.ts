import { supabase } from '@/lib/supabaseclient';

interface FlashcardTestParams {
  wordId: number;
  testType: 'flashcard' | 'typing';
  testResult: boolean;
}

export const useUpdateFlashCardInfo = () => {
  const updateFlashCardInfo = async ({
    wordId,
    testType,
    testResult,
  }: FlashcardTestParams) => {

    try {
      const { data, error } = await supabase.rpc('insert_flashcard_test', {
        _word_id: wordId,
        _test_type: testType,
        _test_result: testResult,
      });

      if (error) {
        console.error('Error updating flashcard info:', error);
        throw error;
      } else {
        console.log('Flashcard info updated successfully:', wordId);
      }

      // Update spaced repetition
      const { data: spacedRepData, error: spacedRepError } = await supabase.rpc('update_spaced_repetition', {
        _test_result: testResult,
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


