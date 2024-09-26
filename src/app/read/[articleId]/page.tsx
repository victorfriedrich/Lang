'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import WordInfoPopup from '@/app/components/WordInfoPopup';
import CompactWordInfoPopup from '@/app/components/CompactWordInfoPopup';
import { useArticleText } from '@/app/hooks/useArticleText';
import { useGetLearningWords } from '@/app/hooks/useGetLearningWords';
import { useGetTranslationForWord } from '@/app/hooks/useGetTranslationForWord';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { ArrowLeft } from 'lucide-react';
import LoadingState from '@/app/components/LoadingState';
const Page = () => {
  const { articleId } = useParams();
  const router = useRouter();
  const [selectedWord, setSelectedWord] = useState<{ word: string, wordId: number, translation?: string, position: { x: number, y: number } } | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  const { articleTitle, articleText, isLoading: isLoadingArticle, error: articleError } = useArticleText(articleId as string);

  const wordIds = useMemo(() =>
    Array.isArray(articleText)
      ? articleText.filter(wordObj => wordObj.id !== undefined).map(wordObj => wordObj.id as number)
      : [],
    [articleText]
  );

  const { learningWords, isLoading: isLoadingWords, error: wordsError } = useGetLearningWords(wordIds);

  const [unknownWordIds, setUnknownWordIds] = useState<number[]>([]);
  const [learningWordIds, setLearningWordIds] = useState<number[]>([]);

  useEffect(() => {
    setUnknownWordIds(learningWords.filter(word => word.status === 'unknown').map(word => word.word_id));
    setLearningWordIds(learningWords.filter(word => word.status === 'learning').map(word => word.word_id));
  }, [learningWords]);

  const { getTranslationForWord, loading: translationLoading, error: translationError } = useGetTranslationForWord();

  const handleWordClick = async (word: string, wordId: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const articleRect = articleRef.current?.getBoundingClientRect();

    if (articleRect) {
      setShowPopup(false); // Hide the popup while loading
      const translation = await getTranslationForWord(wordId);

      setSelectedWord({
        word,
        wordId,
        translation,
        position: {
          x: rect.left + rect.width / 2 - articleRect.left,
          y: rect.top - articleRect.top - 15
        }
      });
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedWord(null);
  };

  const handleAddToLearning = useCallback((wordId: number) => {
    setLearningWordIds(prev => [...prev, wordId]);
  }, []);

  const handleBackToArticles = () => {
    router.push('/articles');
  };

  if (isLoadingArticle || isLoadingWords) {
    return <LoadingState />
  }

  if (articleError || wordsError) {
    return <div>Error: {articleError || wordsError}</div>;
  }

  return (
    <ProtectedRoute>
      <div className="article-container relative bg-white p-8 space-y-2 text-gray-800 leading-relaxed" ref={articleRef}>
        <button
          onClick={handleBackToArticles}
          className="mb-4 flex items-center text-gray-500 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </button>
        <h1 className="text-3xl font-bold mb-6">{articleTitle.replaceAll("_", " ")}</h1>
        <div>
        {Array.isArray(articleText) ? articleText.map((wordObj, index) => {
          const word = wordObj.content;
          const wordId = wordObj.id;
          let className = "cursor-pointer hover:text-gray-500 ";

          if (wordId !== undefined && unknownWordIds.includes(wordId)) {
            className += "text-orange-500 hover:text-orange-600 ";
          } else if (wordId !== undefined && learningWordIds.includes(wordId)) {
            className += "underline underline-thin";
          }

          if (word === "\n\n") {
            return <><br key={`br1-${index}`} /><br key={`br2-${index}`} /></>;
          }

          if (word === "\n") {
            return <br key={`br-${index}`} />;
          }

          if (wordId === undefined) {
            return (
              <span
                key={index}
                className={className}
              >
                {word}
              </span>
            );
          }

          return (
            <span
              key={index}
              className={className}
              onClick={(e) => handleWordClick(word, wordId, e)}
            >
              {word}
            </span>
          );
        }) : <div>No article text available</div>}
        {showPopup && selectedWord && selectedWord.translation && (
          <CompactWordInfoPopup
            word={selectedWord.word}
            wordId={selectedWord.wordId}
            translation={selectedWord.translation}
            onClose={handleClosePopup}
            position={selectedWord.position}
            onAddToLearning={handleAddToLearning}
            showThumbs={!unknownWordIds.includes(selectedWord.wordId)}
          />
        )}
        </div>
      </div>
    </ProtectedRoute >
  );
};

export default Page;