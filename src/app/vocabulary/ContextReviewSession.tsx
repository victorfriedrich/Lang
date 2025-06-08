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
    const words = learningSet
      .slice(currentPage * wordsPerPage, (currentPage + 1) * wordsPerPage)
      .map((w) => w.word);
    (async () => {
      const data = await fetchExamples(words);
      if (isMounted) {
        setExamples(data);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [currentPage, fetchExamples, learningSet]);

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
    return (
      <div className="w-full bg-white min-h-screen">
        <MemoryMatchGame pairs={currentWords} onComplete={handleGameComplete} />
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen">
      <ExampleSentencesList examples={examples} onContinue={handleContinue} />
    </div>
  );
};

export default ContextReviewSession;
