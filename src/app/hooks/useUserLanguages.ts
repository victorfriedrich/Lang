import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

export const useUserLanguages = () => {
  const [userLanguages, setUserLanguages] = useState<string[]>([]);
  const [defaultLanguage, setDefaultLanguage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserLanguages = async () => {
    try {
      setIsLoading(true);
      // Fetch available languages
      const { data: languagesData, error: languagesError } = await supabase.rpc('get_available_languages');
      if (languagesError) throw languagesError;
      
      // Fetch default language
      const { data: defaultLangData, error: defaultLangError } = await supabase.rpc('get_user_default_language');
      if (defaultLangError) throw defaultLangError;
      
      setUserLanguages(languagesData || []);
      setDefaultLanguage(defaultLangData);
    } catch (err) {
      console.error('Error fetching user languages:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user languages'));
    } finally {
      setIsLoading(false);
    }
  };

  const setUserDefaultLanguage = async (languageCode: string): Promise<boolean> => {
    try {
      await supabase.rpc('set_user_default_language', { _language: languageCode });
      setDefaultLanguage(languageCode);
      return true;
    } catch (err) {
      console.error('Error setting default language:', err);
      return false;
    }
  };

  // Fetch languages on mount.
  // Note: Any auth-triggered refetch should be managed from a higher-level component
  // (e.g., in your UserProvider) to avoid duplicate subscriptions.
  useEffect(() => {
    fetchUserLanguages();
  }, []);

  return { 
    userLanguages, 
    defaultLanguage, 
    isLoading, 
    error, 
    fetchUserLanguages, 
    setUserDefaultLanguage 
  };
};
