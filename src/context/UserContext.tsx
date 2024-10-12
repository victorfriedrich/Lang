'use client';

import React, {
  createContext,
  useCallback,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '@/lib/supabaseclient';

interface UserProfile {
  id: string;
  email: string | null;
  is_anonymous: boolean;
  // Add other profile fields as needed
}

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

interface UserContextProps {
  user: UserProfile | null;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  loading: boolean;
  language: LanguageOption | null;
  setLanguage: (language: LanguageOption) => void;
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  fetchWithAuth: async () => new Response(),
  loading: true,
  language: null,
  setLanguage: () => {},
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<LanguageOption | null>(null);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email,
        is_anonymous: session.user.is_anonymous,
      } : null);

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
    // Load language from localStorage or initialize it
    const storedLanguage = localStorage.getItem('app-language');
    if (storedLanguage) {
      setLanguage(JSON.parse(storedLanguage));
    } else {
      // TODO: Replace with actual API call to initialize language
      const defaultLanguage: LanguageOption = {
        code: 'es',
        name: 'Spanish',
        flag: 'es',
      };
      setLanguage(defaultLanguage);
      localStorage.setItem('app-language', JSON.stringify(defaultLanguage));
    }
  }, []);

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      throw new Error('No authentication token available');
    }

    const defaultOptions: RequestInit = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    return fetch(url, { ...defaultOptions, ...options });
  }, []);

  const handleSetLanguage = (newLanguage: LanguageOption) => {
    setLanguage(newLanguage);
    localStorage.setItem('app-language', JSON.stringify(newLanguage));
    // TODO: Add API call to update language preference on the server
  };

  return (
    <UserContext.Provider
      value={{ user, fetchWithAuth, loading, language, setLanguage: handleSetLanguage }}
    >
      {children}
    </UserContext.Provider>
  );
};