import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X, Edit2, Check, ArrowLeft, Eye, BookOpen, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useCustomTranslation } from '@/app/hooks/useCustomTranslation';
import { useWordInfo } from '@/app/hooks/useWordInfo';
import Tooltip from './Tooltip';
interface WordInfoPopupProps {
  onClose: () => void;
  word: string;
  defaultTranslation: string;
  customTranslation: string;
  nextReview: string;
  userId: string;
  wordId: number;
}

const WordInfoPopup: React.FC<WordInfoPopupProps> = ({ 
  onClose, word, defaultTranslation, customTranslation: initialCustomTranslation, 
  nextReview, userId, wordId 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customTranslation, setCustomTranslation] = useState(initialCustomTranslation);
  const [showAllForms, setShowAllForms] = useState(false);
  const { addCustomTranslation, isLoading, error } = useCustomTranslation();
  const { wordInfo, isLoading: isWordInfoLoading, error: wordInfoError } = useWordInfo(userId, wordId);

  const handleSaveTranslation = async () => {
    await addCustomTranslation({ customTranslation, userId, wordId });
    setIsEditing(false);
  };

  const handleResetTranslation = async () => {
    await addCustomTranslation({ customTranslation: '', userId, wordId });
    setCustomTranslation('');
  };

  const getDaysUntilReview = (reviewDate: string) => {
    const today = new Date();
    const review = new Date(reviewDate);
    const diffTime = review.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilReview = getDaysUntilReview(nextReview);
  const visibleForms = showAllForms ? (wordInfo?.alternative_wordforms || []) : (wordInfo?.alternative_wordforms || []).slice(0, 7);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-full relative">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{word}</h2>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs">
              <Calendar size={12} className="mr-1" />
              {daysUntilReview === 0 ? "Today" : 
               daysUntilReview === 1 ? "Tomorrow" : 
               `${daysUntilReview} days`}
            </div>
            <div className="flex items-center space-x-2">
              <Tooltip content={`Seen ${wordInfo?.seencount || 0} times`}>
                <div className="text-gray-500 flex items-center cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors duration-200">
                  <Eye size={14} className="mr-1" />
                  <span className="text-xs">{wordInfo?.seencount || 0}</span>
                </div>
              </Tooltip>
              <Tooltip content={`Practiced ${wordInfo?.reviewcount || 0} times`}>
                <div className="text-gray-500 flex items-center cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors duration-200">
                  <BookOpen size={14} className="mr-1" />
                  <span className="text-xs">{wordInfo?.reviewcount || 0}</span>
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-semibold text-gray-600">Translation</h3>
            {!isEditing && (
              <div className="flex space-x-2">
                {customTranslation && (
                  <button
                    onClick={handleResetTranslation}
                    className="text-gray-500 hover:text-gray-600 text-xs flex items-center"
                  >
                    <RotateCcw size={12} className="mr-1" />
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-500 hover:text-blue-600 text-xs flex items-center"
                >
                  <Edit2 size={12} className="mr-1" />
                  Edit
                </button>
              </div>
            )}
          </div>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={customTranslation}
                onChange={(e) => setCustomTranslation(e.target.value)}
                className="w-full border rounded-md px-2 py-1 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your custom translation"
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 hover:text-gray-700 flex items-center px-2 py-1 rounded-md border border-gray-300 text-xs"
                >
                  <ArrowLeft size={12} className="mr-1" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveTranslation}
                  disabled={isLoading}
                  className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 flex items-center text-xs"
                >
                  <Check size={12} className="mr-1" />
                  Save
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
          ) : (
            <div>
              <p className="text-gray-800 text-sm">
                {customTranslation || defaultTranslation}
              </p>
              {customTranslation && (
                <p className="text-xs text-gray-500 mt-1">
                  Default: {defaultTranslation}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Forms:</h3>
          <div className="flex flex-wrap gap-1">
            {visibleForms.map((form, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                {form}
              </span>
            ))}
            {(wordInfo?.alternative_wordforms?.length || 0) > 7 && (
              <button
                onClick={() => setShowAllForms(!showAllForms)}
                className="bg-gray-300 text-gray-800 px-2 py-1 rounded-full text-xs hover:bg-gray-400 transition-colors duration-200 flex items-center"
              >
                {showAllForms ? (
                  <>
                    <ChevronUp size={12} className="mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} className="mr-1" />
                    {(wordInfo?.alternative_wordforms?.length || 0) - 7} more
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default WordInfoPopup;