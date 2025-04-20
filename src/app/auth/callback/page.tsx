'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseclient';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error during auth callback:', error.message);
        router.push('/login');
      } else if (data.session) {
        const userEmail = data.session.user.email || '';
        const isDemoUser = userEmail.startsWith('demo-');

        if (isDemoUser) {
          router.push('/'); // Redirect demo users to home or a demo-specific page
        } else {
          router.push('/'); // Redirect regular users to home or dashboard
        }
      } else {
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
    </div>
  )
};

export default AuthCallback;