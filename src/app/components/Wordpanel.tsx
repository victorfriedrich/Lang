import React, { useState, useCallback, useEffect } from 'react';
import { useMissingWords } from '../hooks/useMissingWords';
import { Loader2, X, Eye } from 'lucide-react';
import { useUpdateUserwords } from '../hooks/useUpdateUserwords';
import { useSeenVideos } from '../hooks/useSeenVideos';

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
  const { recommendedWords, flaggedWords, isLoading, error } = useMissingWords(videoId);
  const allWords = [...recommendedWords, ...flaggedWords];
  const { addWordsToUserwords } = useUpdateUserwords();
  const { seenVideos, markVideoAsSeen } = useSeenVideos(0);

  const isVideoSeen = seenVideos.includes(videoId);

  const toggleVideoSeen = useCallback(async () => {
    await markVideoAsSeen(videoId);
  }, [videoId, markVideoAsSeen]);

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
      const lastSelectedIndex = allWords.findIndex(w => w.id === selectedWords[selectedWords.length - 1]);
      const [start, end] = [Math.min(index, lastSelectedIndex), Math.max(index, lastSelectedIndex)];
      const newSelection = allWords.slice(start, end + 1).map(w => w.id);
      setSelectedWords(prev => Array.from(new Set([...prev, ...newSelection])));
    } else {
      toggleWordSelection(word.id);
    }
  }, [allWords, selectedWords, toggleWordSelection]);

  const toggleWordGroup = useCallback((group: MissingWord[]) => {
    const ids = group.map(w => w.id);
    const allSelected = ids.every(id => selectedWords.includes(id));
    setSelectedWords(prev =>
      allSelected ? prev.filter(id => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]))
    );
  }, [selectedWords]);

  const toggleRecommendedWords = useCallback(() => {
    toggleWordGroup(recommendedWords);
  }, [toggleWordGroup, recommendedWords]);

  const toggleFlaggedWords = useCallback(() => {
    toggleWordGroup(flaggedWords);
  }, [toggleWordGroup, flaggedWords]);


  const addToLearningSet = useCallback(async () => {
    try {
      await addWordsToUserwords(selectedWords, videoId);
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
      <SelectGroupRow
        label="Select Recommended"
        toggleGroup={toggleRecommendedWords}
        allSelected={
          recommendedWords.length > 0 &&
          recommendedWords.every(w => selectedWords.includes(w.id))
        }
        count={recommendedWords.length}
      />
      <WordList
        recommendedWords={recommendedWords}
        flaggedWords={flaggedWords}
        selectedWords={selectedWords}
        handleWordClick={handleWordClick}
        toggleWordSelection={toggleWordSelection}
        toggleFlaggedWords={toggleFlaggedWords}
      />
      <ToggleSeenButton 
        isVideoSeen={isVideoSeen}
        toggleVideoSeen={toggleVideoSeen}
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
  recommendedWords: MissingWord[];
  flaggedWords: MissingWord[];
  selectedWords: number[];
  handleWordClick: (e: React.MouseEvent, word: MissingWord, index: number) => void;
  toggleWordSelection: (wordId: number) => void;
  toggleFlaggedWords: () => void;
}> = ({ recommendedWords, flaggedWords, selectedWords, handleWordClick, toggleWordSelection, toggleFlaggedWords }) => (
  <div className="flex-1 overflow-y-auto p-4">
    <ul className="space-y-2">
      {recommendedWords.map((word, index) => (
        <WordItem
          key={word.id}
          word={word}
          index={index}
          isSelected={selectedWords.includes(word.id)}
          handleWordClick={handleWordClick}
          toggleWordSelection={toggleWordSelection}
        />
      ))}
      {flaggedWords.length > 0 && (
        <li className="mt-4">
          <SelectGroupRow
            label="Select Flagged"
            toggleGroup={toggleFlaggedWords}
            allSelected={flaggedWords.every(w => selectedWords.includes(w.id))}
            count={flaggedWords.length}
          />
        </li>
      )}
      {flaggedWords.map((word, index) => (
        <WordItem
          key={word.id}
          word={word}
          index={recommendedWords.length + index}
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

const ToggleSeenButton: React.FC<{
  isVideoSeen: boolean;
  toggleVideoSeen: () => void;
  selectedWordsCount: number;
  addToLearningSet: () => void;
}> = ({ isVideoSeen, toggleVideoSeen, selectedWordsCount, addToLearningSet }) => (
  <div className="p-4 border-t flex items-center space-x-2">
    <button 
      onClick={toggleVideoSeen}
      className={`flex items-center justify-center py-2 px-4 font-semibold rounded-md transition-colors duration-200 ${
        isVideoSeen
          ? 'bg-black text-white cursor-not-allowed'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      <Eye size={20} className="mr-2" />
      Seen
    </button>
    <button 
      onClick={addToLearningSet}
      className={`flex-grow py-2 px-4 font-semibold rounded-md transition-colors duration-200 ${
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

const SelectGroupRow: React.FC<{
  label: string;
  toggleGroup: () => void;
  allSelected: boolean;
  count: number;
}> = ({ label, toggleGroup, allSelected, count }) => (
  <div
    className="flex items-center justify-between px-4 py-2 border-b cursor-pointer bg-gray-50 hover:bg-gray-100 text-sm"
    onClick={toggleGroup}
  >
    <span className="font-medium">{label} ({count})</span>
    <input
      type="checkbox"
      checked={allSelected}
      onChange={toggleGroup}
      className="form-checkbox h-4 w-4 text-blue-600"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

export default Wordpanel;
