'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { FlashcardSession } from '../session/FlashcardSession';
import { useOverdueWords } from '../hooks/useOverdueWords';
import { useTopWords } from '../hooks/useTopWords';
import { useStreakData } from '../hooks/useStreakData';
import WordInfoPopup from '../components/WordInfoPopup';
import { getWordsDueToday } from '../utils/dateUtils';

import Header from '../components/VocabHeader';
import ReviewSection from '../components/ReviewSection';
import StreakDetails from '../components/StreakDetails';
import LearningWordsTable from '../components/LearningWordsTable';
import ErrorState from '../components/ErrorState';
import ProtectedRoute from '../components/ProtectedRoute';

const VocabularyLearnerWithStreak = () => {
  const [showSession, setShowSession] = useState(false);
  const [sessionMode, setSessionMode] = useState<'flashcard' | 'writing'>('flashcard');
  const [frontSide, setFrontSide] = useState<'spanish' | 'english'>('english');
  const [selectedWord, setSelectedWord] = useState<any | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [wordsDueToday, setWordsDueToday] = useState<any[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const {
    words: overdueWords,
    error: overdueError,
  } = useOverdueWords(refreshTrigger, {
    source: sourceFilter === 'all' ? undefined : sourceFilter,
  });
  const { topWords, error: topError } = useTopWords(refreshTrigger);
  const { streakData, currentStreak, highestStreak } = useStreakData(refreshTrigger);

  const referenceDate = useMemo(() => new Date(), []);

  // Update words due today based on overdueWords
  useEffect(() => {
    if (overdueWords) {
      const dueToday = getWordsDueToday(overdueWords);
      setWordsDueToday(dueToday);
    }
  }, [overdueWords, refreshTrigger]);

  const handleStartReview = () => {
    setShowSession(true);
  };

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleExitSession = useCallback(() => {
    setShowSession(false);
    handleRefresh();
  }, [handleRefresh]);

  const handleSourceChange = useCallback((src: string) => {
    setSourceFilter(src);
  }, []);

  const handleWordClick = (word: any) => {
    setSelectedWord(word);
  };

  const handleClosePopup = () => {
    setSelectedWord(null);
  };

  if (showSession) {
    // Include all due words, and set translation to a fallback if missing
    const validWords = wordsDueToday.filter(word => 
      word && word.word_id && (word.word_root || word.root)
    ).map(word => ({
      ...word,
      translation: word.translation || 'No translation available',
    }));
    
    return (
      <FlashcardSession
        mode={sessionMode}
        frontSide={frontSide}
        onExit={handleExitSession}
        learningSet={validWords.map((word) => ({
          id: word.word_id,
          word: word.word_root || word.root,
          translation: word.translation,
        }))}
      />
    );
  }

  if (overdueError || topError) {
    return <ErrorState message={overdueError || topError} />;
  }

  return (
    <ProtectedRoute>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <div className="w-full bg-white">
        <Header currentStreak={currentStreak} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ReviewSection wordsDueToday={wordsDueToday} onStartReview={handleStartReview} />

          <StreakDetails
            streakData={streakData}
            currentStreak={currentStreak}
            highestStreak={highestStreak}
            referenceDate={referenceDate}
          />

          {/* New LearningWordsTable with integrated header and search bar */}
          <LearningWordsTable
            onMovedToKnown={handleRefresh}
            onSourceChange={handleSourceChange}
          />
        </div>


      </div>
    </ProtectedRoute>
  );
};

export default VocabularyLearnerWithStreak;
