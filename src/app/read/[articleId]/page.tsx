'use client';

import React, { useState, useMemo } from 'react';
import WordInfoPopup from '@/app/components/WordInfoPopup';
import exampleArticle from '@/app/hooks/exampleArticle.json';
import { useWordInfo } from '@/app/hooks/useWordInfo';
import { useGetLearningWords } from '@/app/hooks/useGetLearningWords';

const Page = () => {
  const [selectedWord, setSelectedWord] = useState<{ word: string, wordId: number } | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const wordIds = useMemo(() => 
    exampleArticle.filter(wordObj => wordObj.id !== undefined).map(wordObj => wordObj.id), 
    [exampleArticle]
  );

  const { learningWords, isLoading, error } = useGetLearningWords(wordIds);

  const unknownWordIds = learningWords.filter(word => word.status === 'unknown').map(word => word.word_id);
  const learningWordIds = learningWords.filter(word => word.status === 'learning').map(word => word.word_id);

  const handleWordClick = (word: string, wordId: number) => {
    setSelectedWord({ word, wordId });
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedWord(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="article-container bg-white p-8 space-y-2 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Article</h1>
      {exampleArticle.map((wordObj, index) => {
        const word = wordObj.content;
        const wordId = wordObj.id;
        let className = "cursor-pointer hover:text-gray-500 ";

        if (unknownWordIds.includes(wordId)) {
          className += "text-orange-500 hover:text-orange-600 ";
        } else if (learningWordIds.includes(wordId)) {
          className += "underline underline-thin";
        }

        if(wordId === undefined) {
            return (
            <span
            key={index}
            className={className}
          >
            {word}
          </span>
        )
        }

        return (
          <span
            key={index}
            className={className}
            onClick={() => handleWordClick(word, wordId)}
          >
            {word}
          </span>
        );
      })}
      {showPopup && selectedWord && (
        <WordInfoPopup
          onClose={handleClosePopup}
          word={selectedWord.word}
          defaultTranslation="default translation"
          customTranslation="custom translation"
          nextReview="next review date"
          userId="user id"
          wordId={selectedWord.wordId}
        />
      )}
    </div>
  );
};

export default Page;
