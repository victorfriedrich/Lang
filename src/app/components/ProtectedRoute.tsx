import React, { ReactNode, useEffect, useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
  requireDemo?: boolean; // Optional prop to allow demo users
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireDemo = false }) => {
  const { user, loading } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in
        router.push('/get-started');
      } else if (!requireDemo && user.isDemo) {
        // Logged in as demo but the route requires a regular account
        router.push('/migrate-login');
      }
    }
  }, [user, loading, router, requireDemo]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user && (requireDemo || !user.isDemo) ? <>{children}</> : null;
};

export default ProtectedRoute;