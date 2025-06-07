import { supabase } from '@/lib/supabaseclient';

export const useSetUserwordsStatus = () => {
  /**
   * Update the status of a set of userwords.
   *
   * @param wordIds Array of word IDs to update
   * @param status  "learning" (default) or "known"
   */
  const updateUserwordsStatus = async (
    wordIds: number[],
    status: 'learning' | 'known' = 'learning'
  ) => {
    try {
      const { data, error } = await supabase.rpc(
        'set_userwords_status',
        {
          _word_ids: wordIds,
          _status: status,
        }
      );

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }

      console.log('Status update response:', data);
      return data;
    } catch (err) {
      console.error('Error updating userwords status:', err);
      throw err;
    }
  };

  return { updateUserwordsStatus };
};
