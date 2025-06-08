'use client';
import React, { useEffect, useState, useMemo } from 'react';
import ExampleSentencesList from '../components/ExampleSentencesList';
import MemoryMatchGame from '../components/MemoryMatchGame';
import { useExampleSentences, ExampleEntry } from '../hooks/useExampleSentences';

interface WordPair {
  word: string;
  translation: string;
}

interface ContextReviewSessionProps {
  learningSet: WordPair[];
  onExit: () => void;
}

const wordsPerPage = 5;

const ContextReviewSession: React.FC<ContextReviewSessionProps> = ({ learningSet, onExit }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [examples, setExamples] = useState<Record<string, ExampleEntry> | null>(null);
  const { fetchExamples } = useExampleSentences();

  const currentWords = useMemo(
    () => learningSet.slice(currentPage * wordsPerPage, (currentPage + 1) * wordsPerPage),
    [currentPage, learningSet]
  );

  useEffect(() => {
    let isMounted = true;
    setShowGame(false);
    setExamples(null);
    (async () => {
      const data = await fetchExamples(currentWords.map((w) => w.word));
      if (isMounted) {
        setExamples(data);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [currentPage, fetchExamples, learningSet, currentWords]);

  const handleContinue = () => setShowGame(true);

  const handleGameComplete = () => {
    const maxPage = Math.ceil(learningSet.length / wordsPerPage) - 1;
    if (currentPage < maxPage) {
      setCurrentPage(p => p + 1);
    } else {
      onExit();
    }
  };

  if (showGame) {
    return <MemoryMatchGame pairs={currentWords} onComplete={handleGameComplete} />;
  }

  return <ExampleSentencesList examples={examples} onContinue={handleContinue} />;
};

export default ContextReviewSession;
