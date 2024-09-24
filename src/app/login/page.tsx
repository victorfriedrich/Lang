'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseclient';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

function Login() {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [retryTimer, setRetryTimer] = useState<number>(60);
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (emailSent && retryTimer > 0) {
      timer = setInterval(() => {
        setRetryTimer((prev) => prev - 1);
      }, 1000);
    } else if (retryTimer === 0) {
      setEmailSent(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [emailSent, retryTimer]);

  useEffect(() => {
    if (user && !loading) {
      // Redirect authenticated users to the dashboard or home page
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setEmailSent(true);
      setRetryTimer(60);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error sending email:', error.message);
            alert(`Error sending email: ${error.message}`);
          } else {
            console.error('An unknown error occurred');
            alert('An unknown error occurred');
          }
    } finally {
      setIsLoading(false);
    }
  };

  const openMail = () => {
    const emailProvider = email.split('@')[1];
    if (emailProvider === 'gmail.com') {
      window.open('https://mail.google.com', '_blank');
    } else {
      window.open('mailto:', '_blank');
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://teyjdjamdlguuezclsrq.supabase.co/storage/v1/object/sign/images/login.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvbG9naW4uanBnIiwiaWF0IjoxNzI2NzMwODYxLCJleHAiOjE3NTgyNjY4NjF9.G2lQx6hT9igfcrORAR7Gz5WkznoXZtgT8XQtZSSldVk&t=2024-09-19T07%3A27%3A41.855Z')",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0) 65%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 50%)"
        }}
      ></div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="mt-6 text-center text-4xl font-extrabold text-gray-800">
              Join Wordcat
            </h1>
            <p className="mt-2 text-center text-lg text-gray-600">
              Discover spanish media optimized for your vocabulary
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="flex shadow-sm">
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="flex-grow appearance-none rounded-l-md px-3 py-2 border border-r-0 border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white bg-opacity-80"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-indigo-400"
                disabled={isLoading || emailSent}
                style={emailSent ? { backgroundColor: '#4f46e5', filter: 'grayscale(50%)' } : {}}
              >
                {isLoading ? (
                  'Sending...'
                ) : emailSent ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    <span>Retry ({retryTimer}s)</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">Login</span>
                    <Send size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
          {emailSent && (
            <div className="text-center text-sm text-gray-600">
              <button
                onClick={openMail}
                className="underline text-gray-600 hover:text-gray-800"
              >
                Open Mail
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;