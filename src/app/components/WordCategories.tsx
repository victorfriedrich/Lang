import React, { useState, useCallback, useEffect } from 'react';
import { useWordRecommendations } from '../hooks/useWordRecommendations';
import { useWordDetails } from '../hooks/useWordDetails';
import { useUpdateUserwords } from '../hooks/useUpdateUserwords';
import { Edit2 } from 'lucide-react';

interface WordCategoriesProps {
  language: string;
  selectedCategory: string | null;
  categories: { category: string; icon: string | null }[];
  onSelectCategory: (category: string) => void;
  categoriesLoading: boolean;
}

const WordCategories: React.FC<WordCategoriesProps> = ({
  language,
  selectedCategory,
  categories,
  onSelectCategory,
  categoriesLoading,
}) => {
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [displayedWordIds, setDisplayedWordIds] = useState<number[]>([]);

  const { recommendations, loading: recommendationsLoading } = useWordRecommendations(
    selectedCategory
  );
  const { words: wordDetails } = useWordDetails(recommendations?.word_ids || []);
  const { addWordsToUserwords } = useUpdateUserwords();

  // Initialize displayed words when recommendations change
  useEffect(() => {
    if (wordDetails) {
      setDisplayedWordIds(wordDetails.map(word => word.word_id));
    }
  }, [wordDetails]);

  const toggleWordSelection = useCallback((id: number) => {
    setSelectedWords(prev => prev.includes(id) ? prev.filter(wordId => wordId !== id) : [...prev, id]);
  }, []);

  const handleWordClick = useCallback((e: React.MouseEvent, index: number, wordId: number) => {
    if (e.shiftKey && lastSelectedIndex !== null) {
      e.preventDefault(); // Prevent text selection
      const rangeStart = Math.min(index, lastSelectedIndex);
      const rangeEnd = Math.max(index, lastSelectedIndex);
      // Include the end index by adding 1 to rangeEnd
      const newSelectedWords = wordDetails
        .slice(rangeStart, rangeEnd + 1)
        .map(word => word.word_id)
        .filter(id => displayedWordIds.includes(id));
      setSelectedWords(prev => Array.from(new Set([...prev, ...newSelectedWords])));
    } else {
      toggleWordSelection(wordId);
      setLastSelectedIndex(index);
    }
  }, [wordDetails, toggleWordSelection, lastSelectedIndex, displayedWordIds]);

  const toggleAllWords = useCallback(() => {
    setSelectedWords(prev => 
      prev.length === displayedWordIds.length ? [] : [...displayedWordIds]
    );
  }, [displayedWordIds]);

  const handleAddToUserwords = async () => {
    try {
      await addWordsToUserwords(selectedWords, `Frequent Words: ${selectedCategory}`);
      // Remove added words from displayed words
      setDisplayedWordIds(prev => prev.filter(id => !selectedWords.includes(id)));
      setSelectedWords([]);
    } catch (err) {
      console.error('Error adding words:', err);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    console.log(`Editing word with id: ${id}`);
  };

  if (!selectedCategory) {
    if (categoriesLoading) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Loading categories...
        </div>
      );
    }

    return (
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.category}
            onClick={() => onSelectCategory(cat.category)}
            className="cursor-pointer rounded-md bg-white text-center py-6 text-gray-700 hover:shadow-md transform hover:-translate-y-1 transition-all duration-200"
          >
            {cat.category}
          </div>
        ))}
      </div>
    );
  }

  // Filter wordDetails to only show words that are in displayedWordIds
  const displayedWords = wordDetails.filter(word => displayedWordIds.includes(word.word_id));

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-grow overflow-auto">
        <table 
          className="min-w-full divide-y divide-gray-200"
          onMouseDown={(e) => e.shiftKey && e.preventDefault()} // Prevent text selection during shift-click
        >
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-3 py-3">
                <input 
                  type="checkbox"
                  checked={selectedWords.length === displayedWords.length && displayedWords.length > 0}
                  onChange={toggleAllWords}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Word
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Translation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frequency in Category
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recommendationsLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  Loading recommendations...
                </td>
              </tr>
            ) : (
              displayedWords.map((word, index) => (
                <tr
                  key={word.word_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onMouseEnter={() => setHoveredRow(word.word_id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={(e) => handleWordClick(e, index, word.word_id)}
                >
                  <td className="w-12 px-3 py-4">
                    <input
                      type="checkbox"
                      checked={selectedWords.includes(word.word_id)}
                      onChange={() => toggleWordSelection(word.word_id)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{word.word}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 flex-grow">{word.translation}</span>
                      <div className="w-6 flex justify-center ml-2">
                        {hoveredRow === word.word_id && (
                          <button
                            onClick={(e) => handleEdit(e, word.word_id)}
                            className="text-gray-400 hover:text-black transition-colors duration-200"
                            aria-label={`Edit ${word.word}`}
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {((recommendations?.improvements[index].valueOf() ?? 0) * 100).toFixed(0)}%
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white bg-opacity-50 backdrop-blur-sm p-4 border-t sticky bottom-0 left-0 right-0">
        <button
          className={`w-full py-2 px-4 font-semibold rounded-md transition-colors duration-200 ${
            selectedWords.length > 0
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={selectedWords.length === 0}
          onClick={handleAddToUserwords}
        >
          Add {selectedWords.length} {selectedWords.length === 1 ? 'word' : 'words'} to Practice
        </button>
      </div>
    </div>
  );
};

export default WordCategories;