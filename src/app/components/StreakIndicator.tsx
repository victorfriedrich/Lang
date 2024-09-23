import React from 'react';
import Tooltip from './Tooltip';

interface StreakData {
  date: string;
  wordsReviewed: number;
}

interface StreakIndicatorProps {
  practiceDates: StreakData[];
  referenceDate: Date;
}

const generateStreakData = (practiceDates: StreakData[], referenceDate: Date) => {
  const endDate = new Date(referenceDate);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 13); // Go back 13 days to get 2 weeks

  return Array.from({ length: 14 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    const practiceInfo = practiceDates.find(pd => pd.date === dateString);
    return practiceInfo ? { date: dateString, wordsReviewed: practiceInfo.wordsReviewed } : { date: dateString, wordsReviewed: 0 };
  });
};

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({ practiceDates, referenceDate }) => {
  const streakData = generateStreakData(practiceDates, referenceDate);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getGreenIntensity = (wordsReviewed: number) => {
    if (wordsReviewed === 0) return 'bg-gray-200';
    if (wordsReviewed < 5) return 'bg-green-300';
    if (wordsReviewed < 10) return 'bg-green-400';
    return 'bg-green-500';
  };

  const firstNonZeroIndex = streakData.findIndex(day => day.wordsReviewed > 0);
  const startDate = firstNonZeroIndex !== -1 ? new Date(streakData[firstNonZeroIndex].date) : new Date(referenceDate);
  const startDayOfWeek = startDate.getDay();

  const rotatedWeekdays = [...weekdays.slice(startDayOfWeek), ...weekdays.slice(0, startDayOfWeek)];

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-1 mb-1">
        {rotatedWeekdays.map((day, index) => (
          <div key={index} className="w-6 text-center">
            <span className="text-xs text-gray-500">{day}</span>
          </div>
        ))}
      </div>
      {[0, 1].map((week) => (
        <div key={week} className="flex space-x-1">
          {rotatedWeekdays.map((_, dayIndex) => {
            const dataIndex = week * 7 + dayIndex + firstNonZeroIndex;
            const day = dataIndex < streakData.length ? streakData[dataIndex] : null;
            
            return (
              <Tooltip 
                key={dayIndex} 
                content={
                  day ? (
                    <div>
                      <div>{new Date(day.date).toLocaleDateString()}</div>
                      <div>{day.wordsReviewed > 0 ? `Reviewed ${day.wordsReviewed} words` : 'No words reviewed'}</div>
                    </div>
                  ) : 'No data'
                }
              >
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-sm ${day ? getGreenIntensity(day.wordsReviewed) : 'bg-gray-100'}`}></div>
                </div>
              </Tooltip>
            );
          })}
        </div>
      ))}
    </div>
  );
};
