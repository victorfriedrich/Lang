'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/context/UserContext';
import LanguageSetup from '../components/LanguageSetup';
import { useCreateDemoAccount } from '../hooks/useCreateDemoAccount';

const ProficiencyPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useContext(UserContext);
  const { createDemoAccount, isLoading: isCreatingDemoAccount } = useCreateDemoAccount();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  
  // If user is already logged in and using a demo account, redirect to videos
  useEffect(() => {
    if (user && user.is_anonymous) {
      router.push('/videos');
    }
  }, [user, router]);

  const handleSetupComplete = async () => {
    // If they already have an account, just redirect
    if (user && !user.is_anonymous) {
      router.push('/videos');
      return;
    }
    
    // Otherwise create a demo account
    setIsCreatingAccount(true);
    try {
      await createDemoAccount({
        language: 'demo', // This will be overridden by the language setup
        level: 'beginner', // This will be overridden by the language setup
      });
      
      router.push('/videos');
    } catch (error) {
      console.error('Error creating demo account:', error);
      alert('An error occurred while creating your account. Please try again.');
      setIsCreatingAccount(false);
    }
  };

  if (loading || isCreatingAccount) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <LanguageSetup
        onComplete={handleSetupComplete}
        isNewAccount={true}
      />
      <div className="fixed bottom-4 left-0 right-0 text-center text-gray-500">
        <p>
          By completing setup, you'll create a demo account.
          <br />
          <a href="/login" className="text-blue-600 hover:underline">
            Already have an account? Log in
          </a>
        </p>
      </div>
    </>
  );
};

export default ProficiencyPage;