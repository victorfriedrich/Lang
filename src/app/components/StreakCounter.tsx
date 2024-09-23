import React from 'react';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  highestStreak: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ currentStreak, highestStreak }) => (
  <div className="flex flex-col items-end">
    <div className="flex items-center">
      <Flame className="text-green-500 h-5 w-5 sm:h-6 sm:w-6 mr-1" />
      <span className="text-2xl sm:text-3xl font-bold text-green-500">{currentStreak}</span>
    </div>
    <div className="text-xs sm:text-sm text-gray-500 mt-1">
      Highest: {highestStreak}
    </div>
  </div>
);
