'use client';

import React, { useState, useMemo } from 'react';
import { Play, Search, Flame } from 'lucide-react';

// Updated mock data structure
const mockData = {
  currentStreak: 3,
  highestStreak: 7,
  words: [
    { word: 'Hola', translation: 'Hello', dueDate: '2023-09-20' },
    { word: 'Gracias', translation: 'Thank you', dueDate: '2023-09-21' },
    { word: 'Por favor', translation: 'Please', dueDate: '2023-09-25' },
    { word: 'Adiós', translation: 'Goodbye', dueDate: null },
    { word: 'Bueno', translation: 'Good', dueDate: '2023-09-20' },
  ],
  practiceDates: ['2024-09-10', '2024-09-11', '2024-09-12', '2023-09-19', '2023-09-20'],
};

// Function to calculate days until repeat
const calculateDaysUntilRepeat = (dueDate: string | null): number | null => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Function to get words due today
const getWordsDueToday = (words: typeof mockData.words): typeof mockData.words => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return words.filter(word => {
    const daysUntilRepeat = calculateDaysUntilRepeat(word.dueDate);
    return daysUntilRepeat === 0;
  });
};

// Updated helper function to generate streak data
const generateStreakData = (practiceDates, referenceDate) => {
  const endDate = new Date(referenceDate);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 13); // Go back 13 days to get 2 weeks

  return Array.from({ length: 14 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    return practiceDates.includes(dateString);
  });
};

const StreakIndicator = ({ practiceDates, referenceDate }) => {
  const streakData = generateStreakData(practiceDates, referenceDate);
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-1 mb-1">
        {weekdays.map((day, index) => (
          <div key={index} className="w-6 text-center">
            <span className="text-xs text-gray-500">{day}</span>
          </div>
        ))}
      </div>
      <div className="flex space-x-1">
        {streakData.slice(0, 7).map((practiced, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-sm ${practiced ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          </div>
        ))}
      </div>
      <div className="flex space-x-1">
        {streakData.slice(7).map((practiced, index) => (
          <div key={index + 7} className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-sm ${practiced ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StreakCounter = ({ currentStreak, highestStreak }: { currentStreak: number; highestStreak: number }) => (
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

const VocabularyLearnerWithStreak = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const wordsDueToday = useMemo(() => getWordsDueToday(mockData.words), []);

  const sortedAndFilteredWords = useMemo(() => {
    return mockData.words
      .map(word => ({
        ...word,
        daysUntilRepeat: calculateDaysUntilRepeat(word.dueDate)
      }))
      .sort((a, b) => {
        if (a.daysUntilRepeat === null && b.daysUntilRepeat !== null) return 1;
        if (a.daysUntilRepeat !== null && b.daysUntilRepeat === null) return -1;
        return (a.daysUntilRepeat || 0) - (b.daysUntilRepeat || 0);
      })
      .filter(word => 
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.translation.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [searchTerm]);

  // Use current date as the reference date
  const referenceDate = new Date();

  return (
    <div className="w-full bg-white shadow-lg overflow-hidden">
      <div className="bg-blue-600 text-white w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-bold">Your Words</h1>
          <p className="text-sm mt-1">Keep up your {mockData.currentStreak}-day streak!</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-800">{wordsDueToday.length}</p>
            <p className="text-sm text-gray-600">words to review</p>
          </div>
          <button className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded flex items-center">
            Start Review
            <Play className="ml-2 h-4 w-4" />
          </button>
        </div>

        <div className="border-t border-b border-gray-200 py-4 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Streak</h2>
          <div className="flex justify-between items-end">
            <StreakIndicator practiceDates={mockData.practiceDates} referenceDate={referenceDate} />
            <div className="hidden sm:block">
              <StreakCounter currentStreak={mockData.currentStreak} highestStreak={mockData.highestStreak} />
            </div>
            <div className="sm:hidden">
              <StreakCounter currentStreak={mockData.currentStreak} highestStreak={mockData.highestStreak} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mt-6">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Learning Set</h2>
            <div className="relative w-48">
              <input
                type="text"
                placeholder="Search words..."
                className="w-full pl-7 pr-2 py-1 text-sm border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Word</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Translation</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Days Until Review</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredWords.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                    <td className="whitespace-nowrap text-sm font-medium text-gray-900 py-2 px-4">{item.word}</td>
                    <td className="whitespace-nowrap text-sm text-gray-500 py-2 px-4">{item.translation}</td>
                    <td className="whitespace-nowrap text-sm text-gray-500 py-2 px-4 text-right">
                      {item.daysUntilRepeat === null ? (
                        <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-gray-800 text-white">
                          Learned
                        </span>
                      ) : item.daysUntilRepeat === 0 ? (
                        <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-red-100 text-red-800">
                          Due Today
                        </span>
                      ) : (
                        `${item.daysUntilRepeat}`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Showing {sortedAndFilteredWords.length} of {mockData.words.length} words you know</span>
              <button className="text-blue-600 hover:text-blue-800">Load more</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyLearnerWithStreak;