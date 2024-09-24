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

      // Optional: set up listener for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      return () => {
        authListener.unsubscribe();
      };
    };

    getUser();
  }, []);

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};
