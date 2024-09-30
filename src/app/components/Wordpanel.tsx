import React, { useState, useCallback, useEffect } from 'react';
import { useMissingWords } from '../hooks/useMissingWords';
import { Loader2, X } from 'lucide-react';
import { useUpdateUserwords } from '../hooks/useUpdateUserwords';

interface WordpanelProps {
  videoId: string;
  videoTitle: string;
  onClose: (addedWordsCount: number) => void;
}

interface MissingWord {
  id: number;
  content: string;
  translation: string;
}

const Wordpanel: React.FC<WordpanelProps> = ({ videoId, videoTitle, onClose }) => {
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const { missingWords, isLoading, error } = useMissingWords(videoId);
  const { addWordsToUserwords } = useUpdateUserwords();

  const toggleWordSelection = useCallback((wordId: number) => {
    setSelectedWords(prevSelectedWords =>
      prevSelectedWords.includes(wordId)
        ? prevSelectedWords.filter(id => id !== wordId)
        : [...prevSelectedWords, wordId]
    );
  }, []);

  const handleWordClick = useCallback((e: React.MouseEvent, word: MissingWord, index: number) => {
    if (e.shiftKey && selectedWords.length > 0) {
      e.preventDefault();
      const lastSelectedIndex = missingWords.findIndex(w => w.id === selectedWords[selectedWords.length - 1]);
      const [start, end] = [Math.min(index, lastSelectedIndex), Math.max(index, lastSelectedIndex)];
      const newSelection = missingWords.slice(start, end + 1).map(w => w.id);
      setSelectedWords(prev => Array.from(new Set([...prev, ...newSelection])));
    } else {
      toggleWordSelection(word.id);
    }
  }, [missingWords, selectedWords, toggleWordSelection]);

  const toggleAllWords = useCallback(() => {
    setSelectedWords(prevSelectedWords =>
      prevSelectedWords.length === missingWords.length
        ? []
        : missingWords.map(word => word.id)
    );
  }, [missingWords]);

  const addToLearningSet = useCallback(async () => {
    try {
      await addWordsToUserwords(selectedWords);
      onClose(selectedWords.length);
    } catch (error) {
      // Error handling could be improved here, e.g., showing an error message to the user
      onClose(0);
    }
  }, [selectedWords, addWordsToUserwords, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setIsShiftPressed(e.shiftKey);
    const handleKeyUp = (e: KeyboardEvent) => setIsShiftPressed(e.shiftKey);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <div 
      className={`
        fixed 
        top-11 md:top-0
        right-0 
        h-[calc(100dvh-48px)] md:h-full
        w-full 
        md:w-1/3 
        bg-white 
        shadow-lg 
        transform 
        transition-transform 
        duration-300 
        ease-in-out 
        flex 
        flex-col 
        z-50 
        ${isShiftPressed ? 'select-none' : ''}
      `}
      onClick={(e) => e.stopPropagation()}
    >
      <Header videoTitle={videoTitle} onClose={onClose} />
      <SelectAllRow 
        toggleAllWords={toggleAllWords} 
        allSelected={selectedWords.length === missingWords.length}
        totalWords={missingWords.length}
      />
      <WordList 
        missingWords={missingWords} 
        selectedWords={selectedWords} 
        handleWordClick={handleWordClick} 
        toggleWordSelection={toggleWordSelection} 
      />
      <AddToLearningSetButton 
        selectedWordsCount={selectedWords.length} 
        addToLearningSet={addToLearningSet} 
      />
    </div>
  );
};

const Header: React.FC<{ videoTitle: string; onClose: (addedWordsCount: number) => void }> = ({ videoTitle, onClose }) => (
  <div className="p-4 border-b">
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold">{videoTitle}</h2>
      <button onClick={() => onClose(0)} className="text-gray-500 hover:text-gray-700">
        <X size={24} />
      </button>
    </div>
  </div>
);

const WordList: React.FC<{
  missingWords: MissingWord[];
  selectedWords: number[];
  handleWordClick: (e: React.MouseEvent, word: MissingWord, index: number) => void;
  toggleWordSelection: (wordId: number) => void;
}> = ({ missingWords, selectedWords, handleWordClick, toggleWordSelection }) => (
  <div className="flex-1 overflow-y-auto p-4">
    <ul className="space-y-2">
      {missingWords.map((word, index) => (
        <WordItem 
          key={word.id}
          word={word}
          index={index}
          isSelected={selectedWords.includes(word.id)}
          handleWordClick={handleWordClick}
          toggleWordSelection={toggleWordSelection}
        />
      ))}
    </ul>
  </div>
);

const WordItem: React.FC<{
  word: MissingWord;
  index: number;
  isSelected: boolean;
  handleWordClick: (e: React.MouseEvent, word: MissingWord, index: number) => void;
  toggleWordSelection: (wordId: number) => void;
}> = ({ word, index, isSelected, handleWordClick, toggleWordSelection }) => (
  <li 
    className="flex items-center justify-between border-b pb-2 cursor-pointer"
    onClick={(e) => handleWordClick(e, word, index)}
  >
    <div className="flex flex-col">
      <span className="font-medium">{word.content}</span>
      <span className="text-gray-500 text-sm">{word.translation || 'No translation'}</span>
    </div>
    <input 
      type="checkbox"
      checked={isSelected}
      onChange={() => toggleWordSelection(word.id)}
      className="form-checkbox h-5 w-5 text-blue-600 ml-3"
      onClick={(e) => e.stopPropagation()}
    />
  </li>
);

const AddToLearningSetButton: React.FC<{
  selectedWordsCount: number;
  addToLearningSet: () => void;
}> = ({ selectedWordsCount, addToLearningSet }) => (
  <div className="p-4 border-t">
    <button 
      onClick={addToLearningSet}
      className={`w-full py-2 px-4 font-semibold rounded-md transition-colors duration-200 ${
        selectedWordsCount > 0
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
      disabled={selectedWordsCount === 0}
    >
      Add {selectedWordsCount} {selectedWordsCount === 1 ? 'item' : 'items'} to Learning Set
    </button>
  </div>
);

const SelectAllRow: React.FC<{
  toggleAllWords: () => void;
  allSelected: boolean;
  totalWords: number;
}> = ({ toggleAllWords, allSelected, totalWords }) => (
  <div 
    className="flex items-center justify-between px-4 py-2 border-b cursor-pointer bg-gray-50 hover:bg-gray-100 text-sm"
    onClick={toggleAllWords}
  >
    <span className="font-medium">Select All ({totalWords})</span>
    <input 
      type="checkbox"
      checked={allSelected}
      onChange={toggleAllWords}
      className="form-checkbox h-4 w-4 text-blue-600"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

export default Wordpanel;
