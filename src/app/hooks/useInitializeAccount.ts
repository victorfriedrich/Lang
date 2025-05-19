import { supabase } from '@/lib/supabaseclient';

export const useInitializeAccount = () => {
  const initializeUserAccount = async (language: string, languageLevel: string) => {
    try {
      console.log('-- Initializing user account for language:', language, 'and language level:', languageLevel);

      // Map language codes (e.g., 'es') to full language names (e.g., 'Spanish')
      const codeToName: Record<string, string> = {
        es: 'spanish',
        de: 'german',
        fr: 'french',
        it: 'italian',
        // Add more as needed
      };

      const languageName = codeToName[language.toLowerCase()] || language;

      const { data, error } = await supabase.rpc('initialize_account', {
        _language: languageName,
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
