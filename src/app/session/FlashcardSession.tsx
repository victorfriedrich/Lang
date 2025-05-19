'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XCircle, ArrowRight, ThumbsUp, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashCard } from './Flashcard';
import { WritingTest } from './WritingTest';
import { SessionSummary } from './SessionOverview';
import { useUpdateFlashCardInfo } from '@/app/hooks/updateFlashCardInfo';

interface FlashcardSessionProps {
  mode: 'flashcard' | 'writing';
  frontSide: 'spanish' | 'english';
  onExit: () => void;
  learningSet: Array<{ id: number; word: string; translation: string }>;
}

interface WordItem {
  word: string;
  translation: string;
  correct: boolean;
}

export const FlashcardSession: React.FC<FlashcardSessionProps> = ({ mode, frontSide, onExit, learningSet: initialLearningSet }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [waitForNextButton, setWaitForNextButton] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [wordList, setWordList] = useState<WordItem[]>([]);
  const [showNextCard, setShowNextCard] = useState(false);
  const { updateFlashCardInfo } = useUpdateFlashCardInfo();

  const [learningSet, setLearningSet] = useState(initialLearningSet);
  const [correctCardIds, setCorrectCardIds] = useState<Set<number>>(new Set());
  const [incorrectCardIds, setIncorrectCardIds] = useState<Set<number>>(new Set());

  // If no cards, exit session immediately
  useEffect(() => {
    if (learningSet.length === 0) {
      onExit();
    }
  }, [learningSet, onExit]);

  const currentCard = learningSet[currentCardIndex];
  const nextCard = learningSet[currentCardIndex + 1];

  // Handler to restart session
  const handleRestart = useCallback(() => {
    setShowSummary(false);
    setCurrentCardIndex(0);
    setCorrectCardIds(new Set());
    setIncorrectCardIds(new Set());
    setWordList([]);
    setIsFlipped(false);
    setInputValue('');
    setFeedback(null);
    setShowCorrectAnimation(false);
    setWaitForNextButton(false);
  }, []);

  const handleFinishSession = useCallback(() => {
    onExit();
  }, [onExit]);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setInputValue('');
    setFeedback(null);
    setWaitForNextButton(false);
    if (currentCardIndex + 1 < learningSet.length) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  }, [currentCardIndex, learningSet.length]);

  const handleAnswer = useCallback((result: 'correct' | 'incorrect', wasFlipped = false) => {
    if (!currentCard) return;
    if (result === 'correct') {
      setCorrectCardIds(prev => {
        if (prev.has(currentCard.id)) return prev;
        const next = new Set(prev);
        next.add(currentCard.id);
        return next;
      });
      setWordList(prev => prev.some(item => item.word === currentCard.word) ? prev : [...prev, { word: currentCard.word, translation: currentCard.translation, correct: true }]);
      setShowCorrectAnimation(true);
      setShowNextCard(true);
      updateFlashCardInfo({ wordId: currentCard.id, testType: 'flashcard', testResult: true });
      setTimeout(() => {
        setShowCorrectAnimation(false);
        setShowNextCard(false);
        handleNext();
      }, 500);
    } else {
      setIncorrectCardIds(prev => {
        if (prev.has(currentCard.id)) return prev;
        const next = new Set(prev);
        next.add(currentCard.id);
        return next;
      });
      setWordList(prev => prev.some(item => item.word === currentCard.word) ? prev : [...prev, { word: currentCard.word, translation: currentCard.translation, correct: false }]);
      setFeedback('incorrect');
      updateFlashCardInfo({ wordId: currentCard.id, testType: 'flashcard', testResult: false });
      if (!wasFlipped) {
        setWaitForNextButton(true);
      } else {
        handleNext();
      }
    }
  }, [currentCard, handleNext, updateFlashCardInfo]);

  const handleSubmit = useCallback(() => {
    const isCorrect = inputValue.toLowerCase().trim() === (frontSide === 'spanish' ? currentCard.translation : currentCard.word).toLowerCase();
    handleAnswer(isCorrect ? 'correct' : 'incorrect');
  }, [inputValue, frontSide, currentCard, handleAnswer]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value), []);

  const handleFlip = useCallback(() => {
    if (!feedback && !showCorrectAnimation) {
      setIsFlipped(!isFlipped);
    }
  }, [feedback, showCorrectAnimation, isFlipped]);

  const handleSwipe = useCallback((result: 'correct' | 'incorrect', wasFlipped: boolean) => {
    handleAnswer(result, wasFlipped);
  }, [handleAnswer]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') { handleFlip(); }
    else if (event.code === 'ArrowRight') {
      if (waitForNextButton || showSummary) {
        handleNext();
      } else {
        handleAnswer('correct', isFlipped);
      }
    } else if (event.code === 'ArrowLeft') {
      handleAnswer('incorrect', isFlipped);
    }
  }, [handleFlip, handleAnswer, handleNext, isFlipped, waitForNextButton, showSummary]);

  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setInputValue('');
    setFeedback(null);
    setShowCorrectAnimation(false);
    setWaitForNextButton(false);
    setShowSummary(false);
  }, [mode, frontSide]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Render summary if session is finished
  if (showSummary) {
    return (
      <SessionSummary
        correctCount={correctCardIds.size}
        incorrectCount={incorrectCardIds.size}
        wordList={wordList}
        onRestart={handleRestart}
        onExit={handleFinishSession}
      />
    );
  }

  // Guard: if no current card (fallback)
  if (!currentCard) {
    return null;
  }

  const totalWords = learningSet.length;
  const completedWords = currentCardIndex;
  const percentageComplete = Math.round((completedWords / totalWords) * 100);

  return (
    <div className="flex flex-col h-[calc(100dvh-48px)] md:h-[calc(100dvh-32px)] bg-white">
      <div className="border-b mb-4">
        <div className="flex justify-between items-center p-4">
          <button className="text-gray-500" onClick={onExit}>
            <X className="h-6 w-6" />
          </button>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">{completedWords} / {totalWords}</h2>
          </div>
        </div>
        <div className="w-full h-1 bg-gray-200">
          <div
            className="h-full bg-blue-600"
            style={{ width: `${percentageComplete}%` }}
          />
        </div>

      </div>
      <div>
        <p className="text-gray-500 text-sm text-center mb-2">Click cards to flip them</p>
        <p className="text-gray-500 text-sm text-center md:hidden">Swipe to go through flashcards</p>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-4">

        <div className="relative w-full max-w-xl focus:outline-none">
          <AnimatePresence>
            {showCorrectAnimation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: -10 }}
                exit={{ opacity: 0, scale: 0.5, y: -6 }}
                transition={{ duration: 0.35 }}
                className="absolute top-0 right-0 text-green-500 z-10"
              >
                <CheckCircle className="h-8 w-8 mr-5 mt-5" aria-hidden="true" />
              </motion.div>
            )}
          </AnimatePresence>
          {nextCard && (
            <div className="absolute top-0 left-0 right-0">
              <FlashCard
                card={nextCard}
                isFlipped={false}
                frontSide={frontSide}
                feedback={null}
                onFlip={() => { }}
                onSwipe={() => { }}
                waitForNextButton={false}
                onNext={() => { }}
                showNextCard={false}
                isNextCard={true}
              />
            </div>
          )}
          <FlashCard
            card={currentCard}
            isFlipped={isFlipped}
            frontSide={frontSide}
            feedback={feedback}
            onFlip={handleFlip}
            onSwipe={handleSwipe}
            waitForNextButton={waitForNextButton}
            onNext={handleNext}
            showNextCard={showNextCard}
            isNextCard={false}
          />
        </div>
      </div>
    </div>
  );
};