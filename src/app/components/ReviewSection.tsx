import React from 'react';
import { Play } from 'lucide-react';

interface ReviewSectionProps {
  wordsDueToday: any[];
  onStartReview: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ wordsDueToday, onStartReview }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-2xl font-bold text-gray-800">{wordsDueToday.length}{wordsDueToday.length >= 225 ? '+' : ''}</p>
      <p className="text-md text-gray-600">{wordsDueToday.length === 1 ? 'word' : 'words'} to practice</p>
    </div>
    <button
      className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded flex items-center"
      onClick={onStartReview}
      disabled={wordsDueToday.length === 0}
    >
      Start Review
      <Play className="ml-2 h-4 w-4" />
    </button>
  </div>
);

export default ReviewSection;