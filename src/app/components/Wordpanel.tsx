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

  
  const addToLearningSet = useCallback(async () => {
    try {
      const userId = '529cf561-a58a-4e90-9148-5e9b0f8c49e1'; // TODO: Replace with actual user ID
      await addWordsToUserwords(userId, selectedWords);
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
      className={`fixed top-0 right-0 h-full w-1/3 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col z-50 ${isShiftPressed ? 'select-none' : ''}`}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the panel
    >
      <Header videoTitle={videoTitle} onClose={onClose} />
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

const Header: React.FC<{ videoTitle: string; onClose: () => void }> = ({ videoTitle, onClose }) => (
  <div className="p-4 border-b">
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold">{videoTitle}</h2>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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

export default Wordpanel;
