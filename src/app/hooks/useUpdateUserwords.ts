import { supabase } from '@/lib/supabaseclient';

export const useUpdateUserwords = () => {
  /**
   * Move a set of words into the user's word list,
   * with an optional status and a required source tag.
   *
   * @param wordIds  Array of word IDs to upsert
   * @param source   Identifier for where these words came from
   * @param status   "learning" (default) or "known"
   */
  const addWordsToUserwords = async (
    wordIds: number[],
    source: string,
    status: 'learning' | 'known' = 'learning'
  ) => {
    try {
      const { data, error } = await supabase.rpc(
        'move_words_to_userwords',
        {
          _word_ids: wordIds,
          _status: status,
          _source: source,
        }
      );

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }

      console.log('RPC response:', data);
      return data;
    } catch (err) {
      console.error('Error updating userwords:', err);
      throw err;
    }
  };

  return { addWordsToUserwords };
};
