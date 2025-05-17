import React, { useEffect, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WordItem {
  word: string;
  translation: string;
  correct: boolean;
}

interface SessionSummaryProps {
  correctCount: number;
  incorrectCount: number;
  wordList: WordItem[];
  onRestart: () => void;
  onExit: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  correctCount,
  incorrectCount,
  wordList,
  onRestart,
  onExit,
}) => {
  const totalWords = correctCount + incorrectCount;
  const percentageCorrect = Math.round((correctCount / totalWords) * 100);

  useEffect(() => {
    if (incorrectCount === 0) {
      confetti({
        particleCount: 70,
        spread: 85,
        origin: { y: 0.6 }
      });
    }
  }, [incorrectCount]);

  // Deduplicate wordList for summary display
  const uniqueWordList = useMemo(() => {
    const seen = new Set<string>();
    return wordList.filter(item => {
      if (seen.has(item.word)) return false;
      seen.add(item.word);
      return true;
    });
  }, [wordList]);

  return (
    <div className="flex flex-col h-[calc(100dvh-48px)] md:h-[calc(100dvh-32px)] bg-white pt-8 md:pt-0"> {/* Adjusted for mobile header */}
      <div className="border-b">
        <div className="flex justify-between items-center p-4">
          <button className="text-gray-500" onClick={onExit}>
            <X className="h-6 w-6" />
          </button>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">{totalWords} / {totalWords}</h2>
          </div>
        </div>
        <div className="w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-green-400"
            style={{ width: `${percentageCorrect}%` }}
          />
        </div>
      </div>

      <div className="flex-grow flex flex-col p-4 overflow-hidden">
        <h3 className="text-2xl font-bold text-black mb-4 text-center">{percentageCorrect}% correct</h3>

        <div className="flex-grow overflow-y-auto mb-4">
          {uniqueWordList.map((item, index) => (
            <div key={index} className="bg-gray-50 p-2 mb-2 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold text-base">{item.word}</p>
                <p className="text-gray-600 text-sm">{item.translation}</p>
              </div>
              {item.correct ? (
                <Check className="text-green-500 h-4 w-4" />
              ) : (
                <X className="text-red-500 h-4 w-4" />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3 w-full pb-safe"> {/* Added pb-safe for additional bottom padding on mobile */}
          {incorrectCount > 0 ? (
            <>
              <button 
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
                onClick={onRestart}
              >
                Keep practicing {incorrectCount} {incorrectCount === 1 ? 'term' : 'terms'}
              </button>
              <button 
                className="w-full py-3 bg-white text-blue-600 border border-blue-600 rounded-md font-semibold"
                onClick={onExit}
              >
                Exit
              </button>
            </>
          ) : (
            <button 
              className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold"
              onClick={onExit}
            >
              Exit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
