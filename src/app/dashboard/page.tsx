"use client";

import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';

const Dashboard = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <div>Please log in!</div>;
  }

  return (
    <div>
      {user.is_anonymous ? (
        <div>Welcome, Demo User!</div>
      ) : (
        <div>Welcome, {user.email}!</div>
      )}
    </div>
  );
};

export default Dashboard;
