'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, ArrowRight, RotateCw, BookOpen, Pencil, ThumbsUp } from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

const initialLearningSet = [
  { id: 1, word: 'hola', translation: 'hello' },
  { id: 2, word: 'adiós', translation: 'goodbye' },
  { id: 3, word: 'gracias', translation: 'thank you' },
  { id: 4, word: 'por favor', translation: 'please' },
  { id: 5, word: 'buenos días', translation: 'good morning' },
];

const ModeSelection = ({ onSelectMode }) => {
  const [frontSide, setFrontSide] = useState('spanish');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <CardContent>
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Choose Your Study Mode</h1>
          <div className="mb-8">
            <Button 
              onClick={() => setFrontSide(prev => prev === 'english' ? 'spanish' : 'english')} 
              className="w-full bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
            >
              <RotateCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Front side: {frontSide === 'english' ? 'English' : 'Spanish'}
            </Button>
          </div>
          <div className="space-y-4">
            <Button 
              onClick={() => onSelectMode('flashcard', frontSide)} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              Flashcard Mode
            </Button>
            <Button 
              onClick={() => onSelectMode('writing', frontSide)} 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
              Writing Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FlashCard = ({ card, isFlipped, frontSide, feedback, onFlip, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-100, 100], [-10, 10]);
  const borderColor = useTransform(
    x,
    [-100, 0, 100],
    ['#ef4444', '#e5e7eb', '#22c55e']
  );

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onSwipe('correct');
    else if (info.offset.x < -100) onSwipe('incorrect', isFlipped);
    else x.set(0);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate }}
      onDragEnd={handleDragEnd}
      className="w-full max-w-md h-64 cursor-grab active:cursor-grabbing relative"
      whileTap={{ cursor: 'grabbing' }}
      whileDrag={{ scale: 1.05 }}
      onClick={onFlip}
    >
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{ borderWidth: 4, borderStyle: 'solid', borderColor }}
      />
      <Card className="w-full h-full shadow-md">
        <CardContent className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute w-full h-full flex flex-col items-center justify-center"
            initial={false}
            animate={{ opacity: isFlipped ? 0 : 1 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              {frontSide === 'spanish' ? card.word : card.translation}
            </h2>
            {feedback === 'incorrect' && (
              <div className="text-red-500 mt-4 flex items-center">
                <XCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                <p>Correct answer: {frontSide === 'spanish' ? card.translation : card.word}</p>
              </div>
            )}
          </motion.div>
          <motion.div
            className="absolute w-full h-full flex items-center justify-center"
            initial={false}
            animate={{ opacity: isFlipped ? 1 : 0 }}
          >
            <h2 className="text-3xl font-bold text-gray-800">
              {frontSide === 'spanish' ? card.translation : card.word}
            </h2>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const WritingTest = ({ card, frontSide, inputValue, onInputChange, onSubmit, feedback }) => (
  <Card className="w-full max-w-md p-6 shadow-md">
    <CardContent>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {frontSide === 'spanish' ? card.word : card.translation}
      </h2>
      <Input
        type="text"
        value={inputValue}
        onChange={onInputChange}
        placeholder={`Type the ${frontSide === 'spanish' ? 'English' : 'Spanish'} translation`}
        className="mb-4"
      />
      <Button onClick={onSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Submit</Button>
      {feedback === 'incorrect' && (
        <div className="mt-4 text-red-500 flex items-center">
          <XCircle className="h-4 w-4 mr-2" aria-hidden="true" />
          <p>Correct answer: {frontSide === 'spanish' ? card.translation : card.word}</p>
        </div>
      )}
    </CardContent>
  </Card>
);

const SessionSummary = ({ correctCount, incorrectCount, onRestart, onExit }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
    <Card className="w-full max-w-md p-8 shadow-lg">
      <CardContent>
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Session Summary</h2>
        <div className="space-y-4 mb-8">
          <p className="text-xl text-gray-600">Words remembered: <span className="font-bold text-green-600">{correctCount}</span></p>
          <p className="text-xl text-gray-600">Words to review: <span className="font-bold text-red-600">{incorrectCount}</span></p>
        </div>
        {incorrectCount > 0 ? (
          <Button onClick={onRestart} className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white">
            Restart with incorrect words
          </Button>
        ) : (
          <p className="text-green-600 text-xl mb-4 text-center font-bold">Congratulations! You've learned all the words!</p>
        )}
        <Button onClick={onExit} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800">Exit to Menu</Button>
      </CardContent>
    </Card>
  </div>
);

const FlashcardSession = ({ mode, frontSide, onExit }) => {
  const [learningSet, setLearningSet] = useState(initialLearningSet);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [waitForNextButton, setWaitForNextButton] = useState(false);
  const [correctCards, setCorrectCards] = useState([]);
  const [incorrectCards, setIncorrectCards] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  const currentCard = learningSet[currentCardIndex];

  const handleAnswer = useCallback((result, wasFlipped = false) => {
    if (result === 'correct') {
      setCorrectCards(prev => [...prev, currentCard]);
      setShowCorrectAnimation(true);
      setTimeout(() => {
        setShowCorrectAnimation(false);
        handleNext();
      }, 500);
    } else {
      setIncorrectCards(prev => [...prev, currentCard]);
      setFeedback('incorrect');
      if (!wasFlipped) {
        setWaitForNextButton(true);
      } else {
        handleNext();
      }
    }
  }, [currentCard]);

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

  const handleSubmit = useCallback(() => {
    const isCorrect = inputValue.toLowerCase().trim() === (frontSide === 'spanish' ? currentCard.translation : currentCard.word).toLowerCase();
    handleAnswer(isCorrect ? 'correct' : 'incorrect');
  }, [inputValue, frontSide, currentCard, handleAnswer]);

  const handleInputChange = useCallback((e) => setInputValue(e.target.value), []);

  const handleFlip = useCallback(() => {
    if (!feedback && !showCorrectAnimation) {
      setIsFlipped(!isFlipped);
    }
  }, [feedback, showCorrectAnimation, isFlipped]);

  const handleSwipe = useCallback((result, wasFlipped) => {
    handleAnswer(result, wasFlipped);
  }, [handleAnswer]);

  const handleRestart = useCallback(() => {
    setLearningSet(incorrectCards);
    setCurrentCardIndex(0);
    setCorrectCards([]);
    setIncorrectCards([]);
    setShowSummary(false);
  }, [incorrectCards]);

  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setInputValue('');
    setFeedback(null);
    setShowCorrectAnimation(false);
    setWaitForNextButton(false);
    setCorrectCards([]);
    setIncorrectCards([]);
    setShowSummary(false);
  }, [mode, frontSide]);

  if (showSummary) {
    return (
      <SessionSummary
        correctCount={correctCards.length}
        incorrectCount={incorrectCards.length}
        onRestart={handleRestart}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md mb-8">
        <div className="bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${(currentCardIndex / learningSet.length) * 100}%` }}
          />
        </div>
        <p className="text-center text-gray-500 mt-2">
          {currentCardIndex} / {learningSet.length} cards completed
        </p>
      </div>

      <div className="relative w-full max-w-md">
        {mode === 'flashcard' ? (
          <FlashCard
            card={currentCard}
            isFlipped={isFlipped}
            frontSide={frontSide}
            feedback={feedback}
            onFlip={handleFlip}
            onSwipe={handleSwipe}
          />
        ) : (
          <WritingTest
            card={currentCard}
            frontSide={frontSide}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            feedback={feedback}
          />
        )}

        <AnimatePresence>
          {showCorrectAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: '50%', y: '0%' }}
              animate={{ opacity: 1, scale: 1, x: '50%', y: '-100%' }}
              exit={{ opacity: 0, scale: 0.5, x: '50%', y: '-150%' }}
              transition={{ duration: 0.5 }}
              className="absolute top-0 right-0 text-green-500"
            >
              <ThumbsUp className="h-12 w-12" aria-hidden="true" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {waitForNextButton && (
        <Button onClick={handleNext} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
          Next <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
};

const Flashcards = () => {
  const [mode, setMode] = useState(null);
  const [frontSide, setFrontSide] = useState('spanish');

  const handleModeSelect = useCallback((selectedMode, selectedFrontSide) => {
    setMode(selectedMode);
    setFrontSide(selectedFrontSide);
  }, []);

  const handleSessionExit = useCallback(() => {
    setMode(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {mode === null ? (
        <ModeSelection onSelectMode={handleModeSelect} />
      ) : (
        <FlashcardSession 
          key={`${mode}-${frontSide}`} 
          mode={mode} 
          frontSide={frontSide} 
          onExit={handleSessionExit} 
        />
      )}
    </div>
  );
};

export default Flashcards;