import { useState } from 'react';
import { supabase } from '@/lib/supabaseclient';

interface UserProfile {
  id: string;
  email: string | null;
  // Add other profile fields as needed
  is_anonymous: boolean;
}

export const useCreateDemoAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createDemoAccount = async (selectedLevel: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        throw error;
      }

      if (data && data.user) {
        // Fetch additional user profile data if necessary
        const { id, email } = data.user;
        const profile: UserProfile = {
          id,
          email,
          is_anonymous: data.user?.app_metadata?.provider === 'anonymous',
        };
        setUser(profile);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating demo account:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { createDemoAccount, isLoading, user, error };
};