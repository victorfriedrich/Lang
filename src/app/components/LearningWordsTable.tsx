/* ------------------------------------------------------------------ *
 *  src/components/LearningWordsTable.tsx                             *
 * ------------------------------------------------------------------ *
 *  • Source-filter dropdown & search **right‑aligned** (ml‑auto).    *
 *  • Uses Filter icon; wider dropdown; no source column.             *
 * ------------------------------------------------------------------ */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown, Check, ChevronDown, Filter } from 'lucide-react';

import { useGetSources } from '../hooks/useGetSources';
import { useGetLearningWords, LearningWord } from '../hooks/useLearningWords';
import { useSetUserwordsStatus } from '../hooks/useSetUserwordsStatus';

/* coloured “days‑due” pill */
function getDuePill(due: string) {
  const l = due.toLowerCase();
  if (l === 'due today') return { label: 'Due Today', color: 'bg-red-200' };
  const n = parseInt(due, 10);
  if (isNaN(n)) return { label: due, color: 'bg-gray-200' };
  if (n < 0) return { label: 'Overdue', color: 'bg-red-200' };
  if (n === 0) return { label: 'Due Today', color: 'bg-red-200' };
  if (n <= 3) return { label: due, color: 'bg-orange-200' };
  if (n <= 7) return { label: due, color: 'bg-yellow-200' };
  return { label: due, color: 'bg-green-200' };
}

/* dropdown */
interface SourcesDropdownProps {
  sources: string[];
  current: string | null;
  onChange: (s: string | null) => void;
}
const SourcesDropdown: React.FC<SourcesDropdownProps> = ({ sources, current, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const opts = [{ value: null, label: 'All Sources' }, ...sources.map((s) => ({ value: s, label: s }))];

  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const label = opts.find((o) => o.value === current)?.label ?? 'All Sources';

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-md font-medium text-gray-700">
        <Filter size={16} />
        <span className="truncate max-w-40 lg:max-w-none">{label}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-xl z-20 border border-gray-200 overflow-hidden">
          <div className="flex flex-col divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {opts.map((o, idx) => (
              <button
                key={idx}
                className={`flex items-center justify-between w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${current === o.value ? 'bg-gray-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                <span className="truncate max-w-56">{o.label}</span>
                {current === o.value && <Check size={16} className="text-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* main component */
interface LearningWordsTableProps {
  onMovedToKnown?: () => void;
  onSourceChange?: (s: string | null) => void;
  source?: string | null;
}

const LearningWordsTable: React.FC<LearningWordsTableProps> = ({
  onMovedToKnown,
  onSourceChange,
  source = null,
}) => {
  /* source dropdown */
  const [sources, setSources] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string | null>(source);
  const { getSources } = useGetSources();
  useEffect(() => {
    (async () => {
      try { setSources(await getSources()); } catch {/* ignore */}
    })();
  }, [getSources]);
  useEffect(() => {
    setSourceFilter(source);
  }, [source]);

  /* order */
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('ASC');
  const toggleDirection = () => setDirection((p) => (p === 'ASC' ? 'DESC' : 'ASC'));

  /* search debounce */
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState<string | null>(null);
  useEffect(() => { const t = setTimeout(() => setDebounced(search.trim() || null), 500); return () => clearTimeout(t); }, [search]);

  /* pagination */
  const pageSize = 20;
  const [cursor, setCursor] = useState<number>(0);
  const [words, setWords] = useState<LearningWord[]>([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => { setCursor(0); setWords([]); setHasMore(true); }, [debounced, sourceFilter, direction]);

  const { learningWords: fetched, isLoading, error } = useGetLearningWords({
    orderDirection: direction,
    cursorWordId: cursor,
    searchTerm: debounced,
    pageSize,
    sourceFilter,
  });

  useEffect(() => {
    if (fetched.length === 0 && cursor !== 0) { setHasMore(false); return; }
    setWords((prev) => (cursor === 0 ? fetched : [...prev, ...fetched]));
  }, [fetched, cursor]);

  /* selection */
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const { updateUserwordsStatus } = useSetUserwordsStatus();

  const toggleWordSelection = (id: number) => {
    setSelectedWords((prev) =>
      prev.includes(id) ? prev.filter((wordId) => wordId !== id) : [...prev, id]
    );
  };

  const handleRowClick = (
    e: React.MouseEvent,
    index: number,
    wordId: number
  ) => {
    if (e.shiftKey && lastSelectedIndex !== null) {
      e.preventDefault();
      const rangeStart = Math.min(index, lastSelectedIndex);
      const rangeEnd = Math.max(index, lastSelectedIndex);
      const newSelected = words.slice(rangeStart, rangeEnd + 1).map((w) => w.word_id);
      setSelectedWords((prev) => {
        const isRemoving = prev.includes(wordId);
        if (isRemoving) {
          return prev.filter((id) => !newSelected.includes(id));
        }
        return Array.from(new Set([...prev, ...newSelected]));
      });
    } else {
      toggleWordSelection(wordId);
      setLastSelectedIndex(index);
    }
  };

  const handleMoveToKnown = async () => {
    try {
      await updateUserwordsStatus(selectedWords, 'known');
      setWords((prev) => prev.filter((w) => !selectedWords.includes(w.word_id)));
      setSelectedWords([]);
      onMovedToKnown?.();
    } catch (err) {
      console.error('Error updating userwords status:', err);
    }
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const lastRowRef = useCallback((node: HTMLTableRowElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && fetched.length === pageSize) {
        const lastId = fetched[fetched.length - 1]?.word_id; if (lastId) setCursor(lastId);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, fetched, pageSize]);

  /* render */
  return (
    <div className="bg-white mt-10 shadow-md rounded-lg flex flex-col h-full">
      {/* header */}
      <div className="flex items-center bg-gray-100 px-4 py-3 rounded-t-lg gap-4">
        <h2 className="text-lg font-semibold text-gray-700">Your Learning Words</h2>

        {/* right‑aligned group */}
        <div className="flex items-center gap-4 ml-auto">
          <SourcesDropdown
            sources={sources}
            current={sourceFilter}
            onChange={(s) => {
              setSourceFilter(s);
              onSourceChange?.(s);
            }}
          />
          <input
            type="text"
            placeholder="Search…"
            className="w-64 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* table */}
      <div className="flex-grow overflow-auto pb-16 hide-scrollbar">
        <table
          className="w-full min-w-max table-auto"
          onMouseDown={(e) => e.shiftKey && e.preventDefault()}
        >
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="w-12 px-3 py-3 text-gray-500 uppercase text-xs font-medium">
                <button onClick={toggleDirection} className="text-gray-400 hover:text-black transition-colors duration-200" aria-label="Toggle order">
                  {direction === 'ASC' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </button>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Translation</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Days&nbsp;to&nbsp;practice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {words.map((w, i) => {
              const last = i === words.length - 1;
              const { label, color } = getDuePill(w.review_due);
              return (
                <tr
                  key={w.word_id}
                  ref={last ? lastRowRef : null}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => handleRowClick(e, i, w.word_id)}
                >
                  <td className="w-12 px-3 py-4">
                    <input
                      type="checkbox"
                      checked={selectedWords.includes(w.word_id)}
                      onChange={(e) => handleRowClick(e as any, i, w.word_id)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap font-medium text-gray-700">{w.word}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-gray-600">{w.translation}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-right w-24">
                    <span className={`inline-block px-3 py-1 rounded-full text-black font-medium ${color}`}>{label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {isLoading && <p className="text-center py-4 text-gray-500">Loading…</p>}
        {error && <p className="text-center py-4 text-red-500">{error}</p>}
        {!isLoading && words.length === 0 && <p className="text-center py-4 text-gray-500">No words found.</p>}
        {!isLoading && !hasMore && words.length > 0 && <p className="text-center py-4 text-gray-500">You have seen all words.</p>}
      </div>
      <div className="bg-white bg-opacity-50 backdrop-blur-sm p-4 border-t sticky bottom-0 left-0 right-0">
        <button
          className={`w-full py-2 px-4 font-semibold rounded-md transition-colors duration-200 ${
            selectedWords.length > 0
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={selectedWords.length === 0}
          onClick={handleMoveToKnown}
        >
          Move {selectedWords.length} {selectedWords.length === 1 ? 'Word' : 'Words'} to Known Words
        </button>
      </div>
    </div>
  );
};

export default LearningWordsTable;
