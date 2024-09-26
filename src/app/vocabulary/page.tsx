'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { Play } from 'lucide-react';
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

import Header from '../components/VocabHeader';
import ReviewSection from '../components/ReviewSection';
import StreakDetails from '../components/StreakDetails';
import VocabularyTable from '../components/VocabularyTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ProtectedRoute from '../components/ProtectedRoute';

const VocabularyLearnerWithStreak = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSession, setShowSession] = useState(false);
  const [sessionMode, setSessionMode] = useState<'flashcard' | 'writing'>('flashcard');
  const [frontSide, setFrontSide] = useState<'spanish' | 'english'>('english');
  const [selectedWord, setSelectedWord] = useState<any | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [wordsDueToday, setWordsDueToday] = useState<any[]>([]);
  const [visibleWordsCount, setVisibleWordsCount] = useState(10);

  const { overdueWords, isLoading: isLoadingOverdue, error: overdueError } = useOverdueWords(refreshTrigger);
  const { topWords, isLoading: isLoadingTop, error: topError } = useTopWords(refreshTrigger);
  const { streakData, currentStreak, highestStreak } = useStreakData(refreshTrigger);

  const referenceDate = useMemo(() => new Date(), []);

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
      );
  }, [topWords, searchTerm]);

  const visibleWords = useMemo(() => {
    return sortedAndFilteredWords.slice(0, visibleWordsCount);
  }, [sortedAndFilteredWords, visibleWordsCount]);

  const handleLoadMore = useCallback(() => {
    setVisibleWordsCount(prevCount => prevCount + 10);
  }, []);

  const hasOverdueWords = overdueWords && overdueWords.length > 0;
  const hasTopWords = topWords && topWords.length > 0;

  const handleStartReview = () => {
    setShowSession(true);
  };

  const handleSelectMode = (mode: 'flashcard' | 'writing', side: 'spanish' | 'english') => {
    setSessionMode(mode);
    setFrontSide(side);
  };

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleExitSession = useCallback(() => {
    setShowSession(false);
    handleRefresh();
  }, [handleRefresh]);

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

  if (overdueError || topError) {
    return <ErrorState message={overdueError || topError} />;
  }

  return (
    <ProtectedRoute>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <div className="w-full bg-white overflow-hidden">
        <Header currentStreak={currentStreak} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ReviewSection wordsDueToday={wordsDueToday} onStartReview={handleStartReview} />

          <StreakDetails
            streakData={streakData}
            currentStreak={currentStreak}
            highestStreak={highestStreak}
            referenceDate={referenceDate}
          />

          <VocabularyTable
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            words={visibleWords}
            onWordClick={handleWordClick}
            totalWordsCount={sortedAndFilteredWords.length}
            onLoadMore={handleLoadMore}
          />

          {/* Remove the separate Load More button */}
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
    </ProtectedRoute>
  );
};

export default VocabularyLearnerWithStreak;