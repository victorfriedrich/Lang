'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Play, Search } from 'lucide-react';
import { FlashcardSession } from '../session/FlashcardSession';
import { ModeSelection } from '../session/ModeSelection';
import { useOverdueWords } from '../hooks/useOverdueWords';
import { useTopWords } from '../hooks/useTopWords';
import { useStreakData } from '../hooks/useStreakData';
import WordInfoPopup from '../components/WordInfoPopup';
import Tooltip from '../components/Tooltip';
import { StreakIndicator } from '../components/StreakIndicator';
import { StreakCounter } from '../components/StreakCounter';
import { calculateDaysUntilRepeat, getWordsDueToday, generateStreakData } from '../utils/dateUtils';
import { useRouter } from 'next/navigation';

const VocabularyLearnerWithStreak = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSession, setShowSession] = useState(false);
  const [sessionMode, setSessionMode] = useState<'flashcard' | 'writing'>('flashcard');
  const [frontSide, setFrontSide] = useState<'spanish' | 'english'>('english');
  const [selectedWord, setSelectedWord] = useState<any | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [wordsDueToday, setWordsDueToday] = useState<any[]>([]);

  const { overdueWords, isLoading: isLoadingOverdue, error: overdueError } = useOverdueWords(refreshTrigger);
  const { topWords, isLoading: isLoadingTop, error: topError } = useTopWords(refreshTrigger);
  const { streakData, currentStreak, highestStreak } = useStreakData('529cf561-a58a-4e90-9148-5e9b0f8c49e1', refreshTrigger);

  useEffect(() => {
    if (overdueWords) {
      const dueToday = getWordsDueToday(overdueWords);
      setWordsDueToday(dueToday);
    }
  }, [overdueWords, refreshTrigger]);

  const sortedAndFilteredWords = useMemo(() => {
    if (!topWords) return [];
    return topWords
      .map(word => ({
        ...word,
        daysUntilRepeat: calculateDaysUntilRepeat(word.next_review_due_at)
      }))
      .filter(word => 
        word.word_root.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.translation.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 10); // Only show first 10 words initially
  }, [topWords, searchTerm]);

  // Use current date as the reference date
  const referenceDate = new Date();

  const handleStartReview = () => {
    setShowSession(true);
  };

  const handleSelectMode = (mode: 'flashcard' | 'writing', side: 'spanish' | 'english') => {
    setSessionMode(mode);
    setFrontSide(side);
  };

  const handleExitSession = useCallback(() => {
    setShowSession(false);
    // Force a full page reload
    window.location.reload();
  }, []);

  const handleWordClick = (word: any) => {
    setSelectedWord(word);
  };

  const handleClosePopup = () => {
    setSelectedWord(null);
  };

  if (showSession) {
    return (
      <FlashcardSession
        mode={sessionMode}
        frontSide={frontSide}
        onExit={handleExitSession}
        learningSet={wordsDueToday.map(word => ({
          id: word.word_id,
          word: word.word_root,
          translation: word.translation
        }))}
      />
    );
  }

  if (isLoadingOverdue || isLoadingTop) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (overdueError || topError) {
    return <div>Error: {overdueError || topError}</div>;
  }

  return (
    <div className="w-full bg-white overflow-hidden">
      <div className="bg-blue-600 text-white w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-bold">Your Words</h1>
          <p className="text-sm mt-1">Keep up your {currentStreak}-day streak!</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-800">{wordsDueToday.length}</p>
            <p className="text-sm text-gray-600">words to review</p>
          </div>
          <button 
            className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded flex items-center"
            onClick={handleStartReview}
            disabled={wordsDueToday.length === 0}
          >
            Start Review
            <Play className="ml-2 h-4 w-4" />
          </button>
        </div>

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

        <div className="bg-white rounded-lg shadow mt-6">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Your Vocabulary</h2>
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
                  <tr 
                    key={item.word_id} 
                    className="hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer"
                    onClick={() => handleWordClick(item)}
                  >
                    <td className="whitespace-nowrap text-sm font-medium text-gray-900 py-2 px-4">{item.word_root}</td>
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
              <span>Showing {sortedAndFilteredWords.length} of {topWords?.length || 0} words</span>
              <button className="text-blue-600 hover:text-blue-800">Load more</button>
            </div>
          </div>
        </div>
      </div>

      {selectedWord && (
        <WordInfoPopup
          onClose={handleClosePopup}
          word={selectedWord.word_root}
          defaultTranslation={selectedWord.translation}
          customTranslation={selectedWord.custom_translation || ''}
          nextReview={selectedWord.next_review_due_at}
          userId={'529cf561-a58a-4e90-9148-5e9b0f8c49e1'}
          wordId={selectedWord.word_id}
        />
      )}
    </div>
  );
};

export default VocabularyLearnerWithStreak;
