import React, { ReactNode, useEffect, useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import LoadingState from './LoadingState';

interface ProtectedRouteProps {
  children: ReactNode;
  requireDemo?: boolean; // Optional prop to allow demo users
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireDemo = false }) => {
  const { user, loading } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    console.log('ProtectedRoute - Loading:', loading, 'User:', user);
    if (!loading && user !== undefined) {
      if (!user) {
        console.log('User not authenticated. Redirecting to /get-started.');
        router.push('/get-started');
      }
    }
  }, [user, loading, router, requireDemo]);

  if (loading) {
    return <LoadingState />;
  }

  return user ? <>{children}</> : null;
};

export default ProtectedRoute;