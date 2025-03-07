import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Edit2, ArrowUp, ArrowDown } from 'lucide-react';
import useUserWords from '../hooks/useUserWords';
import { useUpdateUserwords } from '../hooks/useUpdateUserwords';

interface Word {
  word_id: number;
  word: string;
  translation: string;
  status: string;
}

interface KnownWordsProps {
  searchTerm: string;
}

const getStatusStyle = (status: string): string => {
  if (status === 'Known' || isNaN(parseInt(status))) return 'bg-gray-100 text-black';
  const practiceCount = parseInt(status);
  if (practiceCount === 1) return 'bg-red-100 text-red-800';
  if (practiceCount === 2) return 'bg-orange-100 text-orange-800';
  if (practiceCount === 3) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

const formatStatus = (status: string): string => {
  return isNaN(parseInt(status)) ? 'Known' : `Practiced ${status}x`;
};

const KnownWords: React.FC<KnownWordsProps> = ({ searchTerm }) => {
  const [orderDirection, setOrderDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [displayWords, setDisplayWords] = useState<Word[]>([]);

  const { words, fetchWords, loading, hasMore, error } = useUserWords({
    pageSize: 20,
    orderDirection,
    searchTerm,
  });

  const { addWordsToUserwords } = useUpdateUserwords();

  const observer = useRef<IntersectionObserver | null>(null);

  // Smooth loading of words without flicker by using useEffect
  useEffect(() => {
    if (!loading) {
      setDisplayWords(words);
    }
  }, [words, loading]);

  const lastWordRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            fetchWords();
          }
        },
        { threshold: 0.1, root: null, rootMargin: '20px' }
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchWords]
  );

  const handleEdit = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    console.log(`Editing word with id: ${id}`);
    // Add your edit logic here
  };

  const toggleWordSelection = (id: number) => {
    setSelectedWords((prev) =>
      prev.includes(id) ? prev.filter((wordId) => wordId !== id) : [...prev, id]
    );
  };

  const handleAddToUserwords = async () => {
    try {
      await addWordsToUserwords(selectedWords);
      setSelectedWords([]);
      // Optionally, refetch words or optimistically update the list
    } catch (err) {
      console.error('Error adding words:', err);
      // Handle error (e.g., show a notification)
    }
  };

  const toggleOrderDirection = () => {
    setOrderDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <style jsx global>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="flex-grow overflow-auto hide-scrollbar pb-16">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="w-12 px-3 py-3">
                <button
                  onClick={toggleOrderDirection}
                  className="text-gray-400 hover:text-black transition-colors duration-200 pt-1"
                  aria-label="Toggle Order"
                >
                  {orderDirection === 'ASC' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </button>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Word
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Translation
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayWords.map((word: Word, index: number) => {
              const isLastWord = displayWords.length === index + 1;
              return (
                <tr
                  key={`${word.word_id}-${index}`} // Ensure uniqueness
                  ref={isLastWord ? lastWordRef : null}
                  className="hover:bg-gray-50 cursor-pointer"
                  onMouseEnter={() => setHoveredRow(word.word_id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => toggleWordSelection(word.word_id)}
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
                  <td className="px-3 py-4 whitespace-nowrap font-medium text-gray-900">
                    {word.word}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-gray-500">
                    <div className="flex items-center">
                      <span className="flex-grow">{word.translation}</span>
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
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right w-24">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full ${getStatusStyle(
                        word.status
                      )}`}
                    >
                      {formatStatus(word.status)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loading && <div className="text-center py-4 text-gray-500">Loading...</div>}
        {error && <div className="text-center py-4 text-red-500">{error}</div>}
        {!hasMore && !loading && (
          <div className="text-center py-4 text-gray-500">You have seen all words.</div>
        )}
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
          Move {selectedWords.length} {selectedWords.length === 1 ? 'Word' : 'Words'} to Practice Again
        </button>
      </div>
    </div>
  );
};

export default KnownWords;