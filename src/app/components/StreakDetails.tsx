import React from 'react';
import { StreakIndicator } from '../components/StreakIndicator';
import { StreakCounter } from '../components/StreakCounter';
import { generateStreakData } from '../utils/dateUtils';

interface StreakDetailsProps {
  streakData: any;
  currentStreak: number;
  highestStreak: number;
  referenceDate: Date;
}

const StreakDetails: React.FC<StreakDetailsProps> = ({ streakData, currentStreak, highestStreak, referenceDate }) => (
  <div className="border-t border-b border-gray-200 py-4 mt-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Streak</h2>
    <div className="flex justify-between items-end">
      <StreakIndicator practiceDates={generateStreakData(streakData, referenceDate)} referenceDate={referenceDate} />
      <div className="hidden sm:block">
        <StreakCounter currentStreak={currentStreak} highestStreak={highestStreak} />
      </div>
      <div className="sm:hidden">
        <StreakCounter currentStreak={currentStreak} highestStreak={highestStreak} />
      </div>
    </div>
  </div>
);

export default StreakDetails;