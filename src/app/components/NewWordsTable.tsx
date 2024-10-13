import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useUpdateUserwords } from '../hooks/useUpdateUserwords';
import ConfirmationPopup from './ConfirmationPopup';

interface NewWordsTableProps {
  words: any[];
  onWordAdded: () => void;
}

const NewWordsTable: React.FC<NewWordsTableProps> = ({ words: initialWords, onWordAdded }) => {
  const [words, setWords] = useState(initialWords.slice(0, 5));
  const [remainingWords, setRemainingWords] = useState(initialWords.slice(5));
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const { addWordsToUserwords } = useUpdateUserwords();

  const handleAddWord = async (wordId: number) => {
    try {
      await addWordsToUserwords([wordId]);
      setWords(prevWords => {
        const updatedWords = prevWords.filter(word => word.word_id !== wordId);
        if (remainingWords.length > 0) {
          updatedWords.push(remainingWords[0]);
          setRemainingWords(remainingWords.slice(1));
        }
        return updatedWords;
      });
      setAddedCount(prevCount => prevCount + 1);
      setShowConfirmation(true);
      onWordAdded();
    } catch (error) {
      console.error('Error adding word to vocabulary:', error);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setAddedCount(0);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {showConfirmation && (
        <ConfirmationPopup count={addedCount} onClose={handleCloseConfirmation} />
      )}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Word</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Translation</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Add to practice set</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {words.map((word) => (
              <tr key={word.word_id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                <td className="whitespace-nowrap text-sm font-medium text-gray-900 py-2 px-4">{word.root}</td>
                <td className="whitespace-nowrap text-sm text-gray-500 py-2 px-4">{word.translation}</td>
                <td className="whitespace-nowrap text-sm text-gray-500 py-2 px-4 text-right">
                  <button
                    onClick={() => handleAddWord(word.word_id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewWordsTable;