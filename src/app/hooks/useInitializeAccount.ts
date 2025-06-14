import { supabase } from '@/lib/supabaseclient';

export const useInitializeAccount = () => {
  const initializeUserAccount = async (
    language: string,
    languageLevel: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('initialize_account', {
        _language: language,
        _language_level: languageLevel,
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error initializing user account:', err);
      throw err;
    }
  };

  return { initializeUserAccount };
};
