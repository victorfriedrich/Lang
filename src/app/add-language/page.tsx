'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LanguageSetup from '../components/LanguageSetup';
import { UserContext } from '@/context/UserContext';

const AddLanguagePage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useContext(UserContext);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleComplete = () => {
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
    <div className="w-full h-full">
      <LanguageSetup onComplete={handleComplete} isNewAccount={false} />
    </div>
  );
};

export default AddLanguagePage;