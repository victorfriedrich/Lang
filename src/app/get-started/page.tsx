'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/context/UserContext';
import LanguageAppOnboarding from '../components/LanguageAppOnboarding';

const ProficiencyPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useContext(UserContext);
  
  // If a non-anonymous user exists, redirect immediately
  useEffect(() => {
    if (user && !user.is_anonymous) {
      router.push('/videos');
    }
  }, [user, router]);

  const handleSetupComplete = () => {
    router.push('/videos');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <LanguageAppOnboarding onComplete={handleSetupComplete} isNewAccount={true} />
    </>
  );
};

export default ProficiencyPage;
