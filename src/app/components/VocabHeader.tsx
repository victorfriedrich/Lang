import React from 'react';

interface HeaderProps {
  currentStreak: number;
}

const Header: React.FC<HeaderProps> = ({ currentStreak }) => (
  <div className="bg-blue-600 text-white w-full">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-xl font-bold">Your Words</h1>
      <p className="text-sm mt-1">
        {currentStreak === 0 ? 'Start practicing to begin your streak' : `Keep up your ${currentStreak}-day streak!`}
      </p>
    </div>
  </div>
);

export default Header;