"use client";

import React, { useState, useEffect, FormEvent, useContext } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseclient';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/context/UserContext';

function Login() {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [retryTimer, setRetryTimer] = useState<number>(60);
  const { user } = useContext(UserContext);
  const [error, setError] = useState<string>('');
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
    if (user && !isLoading && !user.is_anonymous) {
      // Redirect authenticated users to the dashboard or home page
      router.push('/');
    }
  }, [user, isLoading, router]);

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
        
        console.log(error.message);
      } else {
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
    <div className="relative min-h-screen max-h-screen bg-gray-100 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://xpovcmbrttmkhnrfspvo.supabase.co/storage/v1/object/public/images//login.jpg')",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0) 65%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.1) 60%)"
        }}
      ></div>
      <div className="relative z-10 flex flex-col items-center mt-20 min-h-screen px-4">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="mt-6 text-center text-4xl font-extrabold font-sans text-gray-800">
              Welcome Back!
            </h1>
            <p className="mt-2 text-center text-lg text-gray-600">
              Already have an account? Receive a link to login here:
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
                className="flex-grow appearance-none rounded-l-md px-3 py-2 border border-r-0 border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-white"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:bg-orange-300 disabled:backdrop-blur-xl"
                disabled={isLoading || emailSent}
                style={emailSent ? { backgroundColor: '#3B82F6', filter: 'grayscale(70%)' } : {}}
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
