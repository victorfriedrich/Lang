"use client"

import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { UserContext } from '@/context/UserContext';
import { useTopWords } from '@/app/hooks/useTopWords';

const DemoAccountHeader: React.FC = () => {
  const { user } = useContext(UserContext);
  const { topWords, isLoading, error } = useTopWords();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user?.is_anonymous && !isLoading && !error) {
      const hasDueWords = topWords.some(word => new Date(word.next_review_due_at).toDateString() !== new Date().toDateString());
      setIsVisible(hasDueWords);
    }
  }, [user, topWords, isLoading, error]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-blue-700 text-white text-center py-1">
      Demo account | <Link href="/start-learning" className="underline underline-offset-2">Sign up</Link> to save your progress.
    </div>
  );
};

export default DemoAccountHeader;