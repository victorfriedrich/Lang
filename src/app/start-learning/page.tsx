"use client"

import React, { useState, FormEvent, useContext } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { UserContext } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Send, RefreshCw, User } from 'lucide-react';
import Link from 'next/link';

const MigrateLogin = () => {
    const [email, setEmail] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [emailSent, setEmailSent] = useState<boolean>(false);
    const [retryTimer, setRetryTimer] = useState<number>(60);
    const { user } = useContext(UserContext)

    const handleMigrate = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!user) {
                alert('No user session found.');
                return;
            }

            // Link the anonymous account with the provided email
            const { error: updateError } = await supabase.auth.updateUser({
                email,
            });

            if (updateError) throw updateError;

            // Send magic link for email verification
            const { error: signInError } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (signInError) throw signInError;

            setEmailSent(true);
            setRetryTimer(60);
            alert('Account upgraded successfully! Please check your email to verify your account.');
        } catch (error) {
            if (error instanceof Error) {
                alert(`Migration failed: ${error.message}`);
            } else {
                alert('An unknown error occurred during migration.');
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

    const handleOAuthSignIn = async (provider: string) => {

        setIsLoading(true);
        try {
            const { data, errorLink } = await supabase.auth.linkIdentity({ provider });
            if (errorLink) {
                alert(`Linking with ${provider} failed: ${errorLink.message}`);
            } else {
                alert(`Successfully linked with ${provider}`);
            }

            const { errorSignIn } = await supabase.auth.signInWithOAuth({ provider });
            if (errorSignIn) {
                alert(`Sign in with ${provider} failed: ${errorSignIn.message}`);
            }

        } catch (error) {
            alert(`An error occurred: ${error.message}`);
        } finally {
            setIsLoading(false);
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
                <div className="w-full max-w-md space-y-8 pb-32">
                    <div>
                        <h1 className="text-center text-4xl font-extrabold text-gray-800">
                            join learnfive
                        </h1>
                        <p className="mt-2 text-center text-lg text-gray-600">
                            (this currently does not work)
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleMigrate}>
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
                                        <span className="mr-2">Sign Up</span>
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
                    {/* <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500">or</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <div className="mt-6 space-y-4">
                        <div id="g_id_onload" data-client_id="YOUR_GOOGLE_CLIENT_ID" data-callback="handleCredentialResponse"></div>
                        <div className="g_id_signin" data-type="standard"></div>
                        <button
                            onClick={() => handleOAuthSignIn('apple')}
                            className="apple-auth-btn w-full flex justify-center items-center px-4 py-2"
                            disabled={isLoading}
                        >
                            <span className="apple-icon"></span>
                            <span>Sign in with Apple</span>
                        </button>
                        <a
                            className="btn btn-primary w-full flex justify-center items-center px-4 py-2"
                            href="/login/oauth/authorize"
                            disabled={isLoading}
                        >
                            <svg className="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
                                <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                            </svg>
                            Sign in with GitHub
                        </a>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

// CSS for Apple button
<style jsx>{`
  .apple-auth-btn {
    padding: 0 16px;
    background-color: #000;
    color: #fff;
    font-size: 14px;
    line-height: 30px;
    border-radius: 4px;
  }
  .apple-icon {
    background-image: url('path/to/apple-logo.svg');
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 8px;
  }
`}</style>

export default MigrateLogin;