import React from 'react';
import { ExampleEntry } from '@/app/hooks/useExampleSentences';

interface ExampleSentencesListProps {
  examples: Record<string, ExampleEntry> | null;
  onContinue: () => void;
}

const highlightWord = (sentence: string, highlight: string) => {
  const regex = new RegExp(`\\b${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  return sentence.replace(regex, match => `<span style="background-color: rgba(255, 165, 0, 0.3);">${match}</span>`);
};

const ExampleSentencesList: React.FC<ExampleSentencesListProps> = ({ examples, onContinue }) => {
  if (!examples) {
    return (
      <div className="max-w-4xl p-4 bg-white animate-pulse">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-4">
              <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl p-4 bg-white">
      <div className="space-y-4">
        {Object.entries(examples).map(([word, data]) => (
          <div key={word} className="mb-4">
            <h2 className="text-xl font-bold text-black mb-3">{word}</h2>
            <div className="space-y-2">
              {data.sentences.map((sentence, idx) => (
                <p
                  key={idx}
                  className="text-lg text-gray-800"
                  dangerouslySetInnerHTML={{
                    __html: highlightWord(sentence, data.highlights[idx] || word),
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={onContinue}
          className="px-6 py-3 rounded-lg font-semibold bg-black text-white hover:bg-gray-800 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ExampleSentencesList;
