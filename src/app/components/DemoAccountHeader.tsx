"use client"

import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { UserContext } from '@/context/UserContext';
import { usePathname } from 'next/navigation';

const DemoAccountHeader: React.FC = () => {
  const { user } = useContext(UserContext);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (user?.is_anonymous) {
      setIsVisible(true);
    }
  }, [user]);

  if (!isVisible || pathname.startsWith('/get-started') || pathname.startsWith('/start-learning') || pathname.startsWith('/login') || pathname.startsWith('/add-language')) {
    return null;
  }

  return (
    <div className="hidden md:block bg-blue-700 text-white text-center py-1">
      Demo account | <Link href="/start-learning" className="underline underline-offset-2">Sign up</Link> to save your progress.
    </div>
  );
};

export default DemoAccountHeader;