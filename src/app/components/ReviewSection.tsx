import React from 'react';
import { Play } from 'lucide-react';

interface ReviewSectionProps {
  wordsDueToday: any[];
  onStartReview: () => void;
  onContextReview?: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ wordsDueToday, onStartReview, onContextReview }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-2xl font-bold text-gray-800">{wordsDueToday.length}{wordsDueToday.length >= 225 ? '+' : ''}</p>
      <p className="text-md text-gray-600">{wordsDueToday.length === 1 ? 'word' : 'words'} to practice</p>
    </div>
    <div className="flex gap-2">
      <button
        className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded flex items-center"
        onClick={onStartReview}
        disabled={wordsDueToday.length === 0}
      >
        Start Review
        <Play className="ml-2 h-4 w-4" />
      </button>
      {onContextReview && (
        <button
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          onClick={onContextReview}
          disabled={wordsDueToday.length === 0}
        >
          Context
        </button>
      )}
    </div>
  </div>
);

export default ReviewSection;