'use client';

import React, {
  createContext,
  useCallback,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '@/lib/supabaseclient';
import { useUserLanguages } from '@/app/hooks/useUserLanguages';
import { useInitializeAccount } from '@/app/hooks/useInitializeAccount';

interface UserProfile {
  id: string;
  email: string | null;
  is_anonymous: boolean;
  // Add other profile fields as needed
}

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

export interface AvailableLanguageOption extends LanguageOption {
  initialized: boolean;
}

interface UserContextProps {
  user: UserProfile | null;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  loading: boolean;
  language: LanguageOption | null;
  availableLanguages: AvailableLanguageOption[];
  setLanguage: (language: LanguageOption) => void;
  initializeLanguage: (language: string, languageLevel: string) => Promise<void>;
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  fetchWithAuth: async () => new Response(),
  loading: true,
  language: null,
  availableLanguages: [],
  setLanguage: () => {},
  initializeLanguage: async () => {},
});

const SUPPORTED_LANGUAGES: Record<string, Omit<LanguageOption, 'initialized'>> = {
  'de': { code: 'de', name: 'German', flag: 'de' },
  'es': { code: 'es', name: 'Spanish', flag: 'es' },
  'it': { code: 'it', name: 'Italian', flag: 'it' },
  'fr': { code: 'fr', name: 'French', flag: 'fr' },
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<LanguageOption | null>(null);
  const { userLanguages, defaultLanguage, isLoading: languagesLoading, fetchUserLanguages, setUserDefaultLanguage } = useUserLanguages();
  const { initializeUserAccount } = useInitializeAccount();
  const [availableLanguages, setAvailableLanguages] = useState<AvailableLanguageOption[]>([]);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const currentUser = session?.user ? {
        id: session.user.id,
        email: session.user.email,
        is_anonymous: session.user.is_anonymous,
      } : null;
      
      setUser(currentUser);

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email,
          is_anonymous: session.user.is_anonymous,
        } : null);
        setLoading(false);
      });

      setLoading(false);

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    getUser();
  }, []);

  useEffect(() => {
    // Process the user languages data to create the available languages list
    if (!languagesLoading) {
      const availableLangs: AvailableLanguageOption[] = Object.values(SUPPORTED_LANGUAGES).map(lang => ({
        ...lang,
        initialized: userLanguages.includes(lang.code)
      }));
      
      setAvailableLanguages(availableLangs);
      
      // If we have a default language set in the database, use it
      if (defaultLanguage && SUPPORTED_LANGUAGES[defaultLanguage]) {
        setLanguageState({
          ...SUPPORTED_LANGUAGES[defaultLanguage]
        });
      } else if (availableLangs.some(l => l.initialized)) {
        // If user has any initialized language, set the first one
        const firstInitialized = availableLangs.find(l => l.initialized);
        if (firstInitialized) {
          setLanguageState(firstInitialized);
        }
      } else {
        // Default to first supported language if nothing is found
        const defaultLang = Object.values(SUPPORTED_LANGUAGES)[0];
        setLanguageState(defaultLang);
      }
    }
  }, [userLanguages, defaultLanguage, languagesLoading]);
  
  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
  
    if (!token) {
      throw new Error('No authentication token available');
    }
  
    const defaultHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
  
    // Only add Content-Type if a body exists and it's not FormData
    if (options.body && !(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }
  
    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers as Record<string, string>),
      },
    };
  
    return fetch(url, mergedOptions);
  }, []);
  
  const handleSetLanguage = async (newLanguage: LanguageOption) => {
    setLanguageState(newLanguage);
    
    // Update default language in database if user is logged in and language is initialized
    if (user && !user.is_anonymous && userLanguages.includes(newLanguage.code)) {
      await setUserDefaultLanguage(newLanguage.code);
    }
  };

  const initializeLanguage = async (language: string, languageLevel: string) => {
    try {
      await initializeUserAccount(language, languageLevel);
      // Refresh the user languages list
      await fetchUserLanguages();
    } catch (error) {
      console.error('Error initializing language:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{ 
        user, 
        fetchWithAuth, 
        loading: loading || languagesLoading, 
        language, 
        availableLanguages,
        setLanguage: handleSetLanguage,
        initializeLanguage
      }}
    >
      {children}
    </UserContext.Provider>
  );
};