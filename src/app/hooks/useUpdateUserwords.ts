import { createBrowserClient } from '@supabase/ssr';

export const useUpdateUserwords = () => {
  const addWordsToUserwords = async (userId: string, wordIds: number[]) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    try {
      const { data, error } = await supabase.rpc('move_words_to_userwords', {
        _user_id: userId,
        _word_ids: wordIds
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error adding words to userwords:', err);
      throw err;
    }
  };

  return { addWordsToUserwords };
};
