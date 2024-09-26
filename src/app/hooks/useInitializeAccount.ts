import { supabase } from '@/lib/supabaseclient';

export const useInitializeAccount = () => {
  const initializeUserAccount = async (languageLevel: string, learningPreference: string) => {
    try {
      const { data, error } = await supabase.rpc('initialize_account', {
        _language_level: languageLevel,
        _learning_preference: learningPreference
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