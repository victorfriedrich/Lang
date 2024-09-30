import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Plus } from 'lucide-react';
import { useWordInfo } from '@/app/hooks/useWordInfo';
import { useUpdateFlashCardInfo } from '@/app/hooks/updateFlashCardInfo';
import { useGetTranslationForWord } from '@/app/hooks/useGetTranslationForWord';
import { useUpdateUserwords } from '@/app/hooks/useUpdateUserwords';
import ConfirmationPopup from './ConfirmationPopup';

interface CompactWordInfoPopupProps {
  word: string;
  wordId: number;
  translation: string;
  onClose: () => void;
  showThumbs?: boolean;
  position: { x: number, y: number };
  onAddToLearning: (wordId: number) => void;
  rootWord?: string;
}

const CompactWordInfoPopup: React.FC<CompactWordInfoPopupProps> = ({
  word,
  wordId,
  translation,
  onClose,
  showThumbs = true,
  position,
  onAddToLearning,
  rootWord,
}) => {
  const { wordInfo, isLoading: isLoadingWordInfo } = useWordInfo(wordId);
  const { updateFlashCardInfo } = useUpdateFlashCardInfo();
  const { addWordsToUserwords } = useUpdateUserwords();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);

  const handleKnown = async () => {
    await updateFlashCardInfo({ wordId, testType: 'flashcard', testResult: true });
    onClose();
  };

  const handleUnknown = async () => {
    await updateFlashCardInfo({ wordId, testType: 'flashcard', testResult: false });
    onClose();
    onAddToLearning(wordId);
  };

  const handleAddToFlashcards = async () => {
    try {
      await addWordsToUserwords([wordId]);
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Failed to add word to flashcards:', error);
    }
  };

  if (isLoadingWordInfo) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <>
      <div 
        ref={popupRef}
        className="absolute z-50 bg-white rounded-lg border border-black/10 shadow-sm p-2 max-w-sm"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%)',
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-md ml-1">{translation}</p>
            {rootWord && <p className="text-sm text-gray-500 ml-1">Root: {rootWord}</p>}
          </div>
          <div className="ml-4 flex">
            {showThumbs ? (
              <>
                <button
                  onClick={handleKnown}
                  className="text-green-500 hover:text-green-600 p-1"
                  title="I know this word"
                >
                  <ThumbsUp size={16} />
                </button>
                <button
                  onClick={handleUnknown}
                  className="text-red-500 hover:text-red-600 p-1"
                  title="I don't know this word"
                >
                  <ThumbsDown size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={handleAddToFlashcards}
                className="text-blue-500 hover:text-blue-600 p-1"
                title="Add to flashcards"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        </div>
        <div 
          className="absolute w-3 h-3 bg-white border border-black/10 transform rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2"
          style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
        ></div>
      </div>
      {showConfirmation && (
        <ConfirmationPopup
          count={1}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
};

export default CompactWordInfoPopup;