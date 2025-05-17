import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import useLearningWords, { LearningWord } from '../hooks/useLearningWords';

/**
 * Helper to decide label/color for "days due" based on content.
 * - If it's "due today", label = "Due Today", red pill
 * - If it's numeric, color by range:
 *     1–3 => orange
 *     4–7 => yellow
 *     >7  => green
 *     <=0 => red (overdue)
 * - Otherwise, gray pill fallback
 */
function getDuePill(dueStr: string) {
  const lower = dueStr.toLowerCase();

  // Special case: "due today"
  if (lower === 'due today') {
    return { label: 'Due Today', colorClass: 'bg-red-200' };
  }

  // Attempt to parse numeric days
  const numericDue = parseInt(dueStr, 10);

  // If it's not a valid number, fallback to gray
  if (isNaN(numericDue)) {
    return { label: dueStr, colorClass: 'bg-gray-200' };
  }

  // Numeric-based coloring
  if (numericDue < 0) {
    // Overdue
    return { label: 'Overdue', colorClass: 'bg-red-200' };
  } else if (numericDue === 0) {
    // Due today
    return { label: 'Due Today', colorClass: 'bg-red-200' };
  } else if (numericDue <= 3) {
    return { label: dueStr, colorClass: 'bg-orange-200' };
  } else if (numericDue <= 7) {
    return { label: dueStr, colorClass: 'bg-yellow-200' };
  } else {
    return { label: dueStr, colorClass: 'bg-green-200' };
  }
}

const LearningWordsTable: React.FC = () => {
  const [orderDirection, setOrderDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [displayWords, setDisplayWords] = useState<LearningWord[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { words, fetchWords, loading, hasMore, error } = useLearningWords({
    pageSize: 20,
    orderDirection,
    searchTerm: debouncedSearch,
  });

  const observer = useRef<IntersectionObserver | null>(null);

  /**
   * Debounce search: wait 500ms after typing stops,
   * then update `debouncedSearch`. If empty => '' (fetch all).
   */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim() || '');
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  /**
   * Whenever debouncedSearch changes, trigger a fresh fetch.
   * (Depending on your custom hook, you may or may not need this.)
   */
  useEffect(() => {
    fetchWords(); // Re-fetch from page 1 with new searchTerm
  }, [debouncedSearch, fetchWords]);

  /**
   * Update displayed words when new data arrives
   */
  useEffect(() => {
    if (!loading) {
      setDisplayWords(words);
    }
  }, [words, loading]);

  /**
   * Infinite scrolling using IntersectionObserver
   */
  const lastWordRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchWords();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchWords]
  );

  /**
   * Toggle ascending/descending order
   */
  const toggleOrderDirection = () => {
    setOrderDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
  };

  return (
    <div className="bg-white mt-10 shadow-md rounded-lg">
      {/* Header with Title and Search Bar */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-700">Your Learning Words</h2>
        <input
          type="text"
          placeholder="Search..."
          className="w-1/3 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table Container */}
      <div className="overflow-auto pb-16">
        <table className="w-full min-w-max table-auto">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="w-12 px-3 py-3 text-gray-500 uppercase text-xs font-medium">
                <button
                  onClick={toggleOrderDirection}
                  className="text-gray-400 hover:text-black transition-colors duration-200"
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
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                Days to practice
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-sm">
            {displayWords.map((word: LearningWord, index: number) => {
              const isLastWord = displayWords.length === index + 1;
              const { label, colorClass } = getDuePill(word.review_due);

              return (
                <tr
                  key={`${word.word_id}-${index}`}
                  ref={isLastWord ? lastWordRef : null}
                  className="hover:bg-gray-50"
                >
                  <td className="w-12 px-3 py-4"></td>
                  <td className="px-3 py-4 whitespace-nowrap font-medium text-gray-700">
                    {word.word}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-gray-600">
                    {word.translation ?? ''}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right w-24">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-black font-medium ${colorClass}`}
                    >
                      {label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading && (
          <div className="text-center py-4 text-gray-500">
            Loading...
          </div>
        )}
        {error && (
          <div className="text-center py-4 text-red-500">
            {error}
          </div>
        )}
        {!hasMore && !loading && displayWords.length > 0 && (
          <div className="text-center py-4 text-gray-500">
            You have seen all words.
          </div>
        )}

        {/* If there's absolutely no data to show */}
        {!loading && displayWords.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No words found.
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningWordsTable;
