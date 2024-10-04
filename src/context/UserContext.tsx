'use client';

import React, { createContext, useCallback, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

interface UserProfile {
  id: string;
  email: string | null;
  is_anonymous: boolean;
  // Add other profile fields as needed
}

interface UserContextProps {
  user: UserProfile | null;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  loading: boolean;
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  fetchWithAuth: async () => new Response(),
  loading: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      throw new Error('No authentication token available');
    }

    const defaultOptions: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    return fetch(url, { ...defaultOptions, ...options });
  }, []);

  return (
    <UserContext.Provider value={{ user, fetchWithAuth, loading }}>
      {children}
    </UserContext.Provider>
  );
};
