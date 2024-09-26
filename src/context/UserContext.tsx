'use client';

import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      setUser(session?.user || null);

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      return () => {
        authListener.unsubscribe();
      };
    };

    getUser();
  }, []);

  const fetchWithAuth = async (url, options = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      throw new Error('No authentication token available');
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    return fetch(url, { ...defaultOptions, ...options });
  };

  return (
    <UserContext.Provider value={{ user, fetchWithAuth }}>
      {children}
    </UserContext.Provider>
  );
};
