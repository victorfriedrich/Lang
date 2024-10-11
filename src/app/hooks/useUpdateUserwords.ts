import { supabase } from '@/lib/supabaseclient';

export const useUpdateUserwords = () => {
  const addWordsToUserwords = async (wordIds: number[]) => {
    
    try {
      const { data, error } = await supabase.rpc('move_words_to_userwords', {
        _word_ids: wordIds
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log(data);
      return data;
    } catch (err) {
      console.error('Error adding words to userwords:', err);
      throw err;
    }
  };

  return { addWordsToUserwords };
};
