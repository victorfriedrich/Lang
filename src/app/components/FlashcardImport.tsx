'use client';

import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AlertCircle, Check, CheckCircle, Edit3, Trash2, X } from 'lucide-react';
import { useProcessMissingWords } from '../hooks/useFlashcards';
import { useWordDetails } from '../hooks/useWordDetails';
import { useUpdateUserwords } from '../hooks/useUpdateUserwords';
import { UserContext } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

const FlashcardImport = ({ data, onCancel, onComplete }) => {
  const router = useRouter();
  // Data from the initial upload response
  const identifiedWords = data?.identified || [];
  const missingWords = data?.missing || [];

  // Local state for missing words and to track if AI was used
  const [updatedMissingWords, setUpdatedMissingWords] = useState(missingWords);
  const [aiUsed, setAiUsed] = useState(false);

  // Selected words initialized with identified words' IDs
  const [selectedWords, setSelectedWords] = useState(identifiedWords.map(word => word.id));
  const [hoveredRow, setHoveredRow] = useState(null);
  const [useSystemTranslation, setUseSystemTranslation] = useState(true);
  const [showWarningSticky, setShowWarningSticky] = useState(missingWords.length > 0);

  const { language } = useContext(UserContext);
  
  const { processMissingWords, loading: processingUncommon, error: processingError } = useProcessMissingWords();
  const { addWordsToUserwords } = useUpdateUserwords();
  const { fetchWithAuth } = useContext(UserContext);

  useEffect(() => {
    setUpdatedMissingWords(missingWords);
  }, [missingWords]);

  // Deduplicate word IDs for the RPC call to prevent excessive requests.
  const allWordIds = useMemo(() => {
    const ids = [
      ...identifiedWords.map(word => word.id),
      ...updatedMissingWords.filter(word => word.id).map(word => word.id)
    ];
    return Array.from(new Set(ids));
  }, [identifiedWords, updatedMissingWords]);

  // Fetch word details using the RPC.
  // The RPC returns objects with keys: word_id, word, translation.
  const { words: wordDetails } = useWordDetails(allWordIds);

  // Merge fetched details:
  // - Use the RPC's "word" as the processed "Imported as" value.
  // - Use the RPC's "translation" as "system_translation".
  const mergeWordDetails = (word) => {
    if (!word.id) return word;
    const details = wordDetails.find(d => d.word_id === word.id);
    return details
      ? {
          ...word,
          // The "Imported as" column uses the fetched "word" (which is the processed root)
          root: details.word,
          system_translation: details.translation
        }
      : word;
  };

  const mergedIdentifiedWords = identifiedWords.map(mergeWordDetails);
  const mergedMissingWords = updatedMissingWords.map(mergeWordDetails);

  // Only show the yellow bar if there are unselected words requiring review
  const unselectedMissingWords = mergedMissingWords.filter((word: any) => !word.id || !selectedWords.includes(word.id));
  useEffect(() => {
    setShowWarningSticky(unselectedMissingWords.length > 0);
  }, [unselectedMissingWords.length]);

  const handleToggleWordSelection = (wordId) => {
    setSelectedWords(prev =>
      prev.includes(wordId)
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId]
    );
  };

  // Process missing words via AI and mark that AI has been used.
  const handleProcessUncommonWords = async () => {
    // Only process missing words that are not already selected
    const toProcess = updatedMissingWords.filter(word => !word.id || !selectedWords.includes(word.id));
    if (toProcess.length === 0) return;

    try {
      const result = await processMissingWords(
        toProcess,
        language?.code || 'es',
        'flashcards_import'
      );
      setAiUsed(true);
      if (result && result.processed) {
        // Update only the processed words
        const updated = updatedMissingWords.map(word => {
          const processedWord = result.processed.find(p => p.word === word.word);
          if (processedWord) {
            return { ...word, id: processedWord.id };
          }
          return word;
        });
        setUpdatedMissingWords(updated);
        setSelectedWords(prev => {
          const newIds = result.processed.filter(p => p.id).map(p => p.id);
          return [...new Set([...prev, ...newIds])];
        });
      }
    } catch (error) {
      console.error('Failed to process missing words:', error);
    }
  };

  // Helper for checking split words in backend cache
  const checkWordsInCache = async (
    words: string[],
    fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>
  ): Promise<{ identified: any[]; missing: any[] }> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetchWithAuth(`${API_URL}/flashcards/check-words`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words, language: language?.code || 'es' }),
    });
    if (!response.ok) throw new Error('Failed to check words in cache');
    return response.json();
  };

  // Split Words logic (split on spaces and slashes, update UI instantly)
  const handleSplitWords = async () => {
    // Only split missing words that are not already selected and have no id
    const toSplit = updatedMissingWords.filter((word: any) => !word.id || !selectedWords.includes(word.id));
    if (toSplit.length === 0) {
      console.log('No words to split');
      return;
    }

    // Prepare split candidates: split on all whitespace and slashes, flatten, trim, dedupe
    let splitCandidates: string[] = [];
    toSplit.forEach((word: any) => {
      // Split on all whitespace and slashes
      const parts = word.word
        .split(/\s+|\//g)
        .map((w: string) => w.trim())
        .filter(Boolean);
      parts.forEach((part: string) => {
        if (!splitCandidates.includes(part)) {
          splitCandidates.push(part);
        }
      });
    });
    console.log('Split candidates:', splitCandidates);
    if (splitCandidates.length === 0) {
      console.log('No split candidates after splitting');
      return;
    }

    try {
      const { identified, missing } = await checkWordsInCache(splitCandidates, fetchWithAuth);
      console.log('API response:', { identified, missing });
      // Remove original phrases from missing
      setUpdatedMissingWords((prev: any[]) => {
        // Remove all originals that were split
        let newMissing = prev.filter(word => !toSplit.some(orig => orig.word === word.word));
        // Add missing split parts (unselected, no id)
        missing.forEach((w: any) => {
          if (!newMissing.some(word => word.word === w.word)) {
            newMissing.push({ word: w.word, translation: '' });
          }
        });
        // Add identified split parts (with id/translation)
        identified.forEach((w: any) => {
          if (!newMissing.some(word => word.word === w.word)) {
            newMissing.push({ word: w.word, translation: w.translation || '', id: w.id });
          }
        });
        return newMissing;
      });
      // Add found split words to selected/common
      setSelectedWords((prev: any[]) => {
        const newIds = identified.map((w: any) => w.id);
        return [...new Set([...prev, ...newIds])];
      });
    } catch (error) {
      console.error('Failed to split and check words:', error);
    }
  };

  // When Add to Practice is clicked, call the RPC to move words to userwords.
  // We assume the backend will use the user's translations if available.
  const handleAddSelectedToPractice = async () => {
    if (selectedWords.length === 0) return;

    try {
      await addWordsToUserwords(selectedWords);
      onComplete && onComplete(selectedWords); // Pass selected words to parent
      router.push('/vocabulary');
    } catch (error) {
      console.error('Error moving words to userwords:', error);
    }
  };

  return (
    <div className="w-full bg-white min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold">Import Flashcards</h1>
        <p className="text-gray-500 mt-1">Imported file</p>
        <div className="mt-4 flex items-center">
          <input 
            type="checkbox" 
            id="translationToggle" 
            className="mr-2 h-4 w-4"
            checked={useSystemTranslation}
            onChange={() => setUseSystemTranslation(!useSystemTranslation)}
          />
          <label htmlFor="translationToggle" className="text-gray-700">
            Use system translations instead of my own
          </label>
        </div>
      </div>

      {/* Common Words Section */}
      {mergedIdentifiedWords.length > 0 && (
        <div className="px-6 pt-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Common Words
          </h2>
          <div className="mb-8">
            <div className="grid grid-cols-12 gap-4 bg-gray-100 p-3 rounded-t-lg font-medium text-sm">
              {/* Checkbox column */}
              <div className="col-span-1 flex items-center justify-center">
                <input 
                  type="checkbox"
                  checked={
                    mergedIdentifiedWords.length > 0 &&
                    mergedIdentifiedWords.every(word => selectedWords.includes(word.id))
                  }
                  onChange={() => {
                    const allSelected = mergedIdentifiedWords.every(word => selectedWords.includes(word.id));
                    if (allSelected) {
                      setSelectedWords(prev => prev.filter(id => !mergedIdentifiedWords.some(word => word.id === id)));
                    } else {
                      const identifiedIds = mergedIdentifiedWords.map(word => word.id);
                      setSelectedWords(prev => [...new Set([...prev, ...identifiedIds])]);
                    }
                  }}
                  className="h-4 w-4"
                />
              </div>
              {/* Renamed columns */}
              <div className="col-span-2 text-gray-500">Flashcard</div>
              <div className="col-span-2">Imported as</div>
              <div className="col-span-3 truncate">System Translation</div>
              <div className="col-span-4 truncate">Your Translation</div>
            </div>
            {mergedIdentifiedWords.map((word) => {
              const isSelected = selectedWords.includes(word.id);
              return (
                <div 
                  key={word.id} 
                  className={`grid grid-cols-12 gap-4 p-3 border-b hover:bg-gray-50 ${isSelected ? '' : 'bg-gray-50 text-gray-400'}`}
                  onMouseEnter={() => setHoveredRow(word.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => handleToggleWordSelection(word.id)}
                      className="h-4 w-4"
                    />
                  </div>
                  {/* Flashcard column: gray text */}
                  <div className="col-span-2 truncate text-gray-500" title={word.word}>
                    {word.word}
                  </div>
                  {/* Imported as column: normal text */}
                  <div className="col-span-2 truncate" title={word.root || word.word}>
                    {word.root || word.word}
                  </div>
                  <div className="col-span-3 truncate" title={word.system_translation || ''}>
                    {word.system_translation || ''}
                  </div>
                  <div className="col-span-4 flex items-center">
                    <span className="truncate flex-grow" title={word.translation || ''}>
                      {word.translation || ''}
                    </span>
                    {hoveredRow === word.id && (
                      <div className="flex shrink-0 space-x-1 ml-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit3 size={16} />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing Words Section */}
      {mergedMissingWords.length > 0 && (
        <div id="uncommon-section" className="px-6 pb-32">
          <div className="mb-3">
            <h2 className="text-lg font-semibold flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              Words Requiring Review
            </h2>
          </div>
          <p className="text-gray-600 mb-3">
            These cards contain words that are not among the 100k most common ones.
          </p>
          <div className="mb-4 flex gap-2">
            <button 
              className="flex items-center px-3 py-1.5 border border-gray-300 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-all"
              onClick={handleProcessUncommonWords}
              disabled={processingUncommon}
            >
              {processingUncommon ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-gray-600 rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Enhance with AI <Check size={16} className="ml-1.5" />
                </>
              )}
            </button>
            <button
              className="flex items-center px-3 py-1.5 border border-blue-300 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-all"
              onClick={handleSplitWords}
              disabled={processingUncommon}
            >
              Split Words
            </button>
          </div>
          {processingError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              Error processing uncommon words: {processingError}
            </div>
          )}
          <div className="grid grid-cols-12 gap-4 bg-gray-100 p-3 rounded-t-lg font-medium text-sm">
            <div className="col-span-1 flex items-center justify-center">
              <input 
                type="checkbox"
                checked={
                  mergedMissingWords.length > 0 &&
                  mergedMissingWords.filter(word => word.id)
                    .every(word => selectedWords.includes(word.id))
                }
                onChange={() => {
                  const allSelected = mergedMissingWords
                    .filter(word => word.id)
                    .every(word => selectedWords.includes(word.id));
                  if (allSelected) {
                    setSelectedWords(prev => prev.filter(id => !mergedMissingWords.some(word => word.id === id)));
                  } else {
                    const missingIds = mergedMissingWords
                      .filter(word => word.id)
                      .map(word => word.id);
                    setSelectedWords(prev => [...new Set([...prev, ...missingIds])]);
                  }
                }}
                className="h-4 w-4"
              />
            </div>
            <div className="col-span-2 text-gray-500">Flashcard</div>
            <div className="col-span-2">Imported as</div>
            <div className="col-span-3 truncate">System Translation</div>
            <div className="col-span-4 truncate">Your Translation</div>
          </div>
          {mergedMissingWords.map((word, index) => {
            const isSelected = word.id && selectedWords.includes(word.id);
            return (
              <div 
                key={`missing-${index}`} 
                className={`grid grid-cols-12 gap-4 p-3 border-b hover:bg-gray-50 ${isSelected ? '' : 'bg-gray-50 text-gray-400'}`}
                onMouseEnter={() => setHoveredRow(`missing-${index}`)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <div className="col-span-1 flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => word.id && handleToggleWordSelection(word.id)}
                    disabled={!word.id}
                    className="h-4 w-4"
                  />
                </div>
                <div className="col-span-2 truncate flex items-center text-gray-500" title={word.word}>
                  {word.word}
                  {aiUsed && !word.id && (
                    <AlertCircle size={16} className="text-yellow-500 ml-1" title="No matching word found" />
                  )}
                </div>
                <div className="col-span-2 truncate text-gray-600" title={word.root || word.word}>
                  {word.root || word.word}
                </div>
                <div className="col-span-3 truncate" title={word.system_translation || ''}>
                  {word.system_translation || ''}
                </div>
                <div className="col-span-4 flex items-center">
                  <span className="truncate flex-grow" title={word.translation || ''}>
                    {word.translation || ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Footer */}
      <div className="sticky bottom-0 w-full z-10">
        {showWarningSticky && unselectedMissingWords.length > 0 && (
          <div className="bg-amber-50 border-t border-amber-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-start">
              <AlertCircle className="text-amber-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-amber-800">Found {unselectedMissingWords.length} words that we haven't seen before.</p>
            </div>
            <div className="flex items-center">
              <button 
                className="text-amber-800 hover:underline text-sm font-medium flex items-center"
                onClick={() => document.getElementById('uncommon-section').scrollIntoView({ behavior: 'smooth' })}
              >
                Show words
              </button>
              <button 
                className="ml-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowWarningSticky(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-white shadow-md">
          <div className="text-gray-600">
            Selected {selectedWords.length} of {mergedIdentifiedWords.length + mergedMissingWords.filter(w => w.id).length} words
          </div>
          <div className="flex space-x-3">
            <button 
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className={`px-6 py-2 rounded font-medium transition-colors ${
                selectedWords.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={selectedWords.length === 0}
              onClick={handleAddSelectedToPractice}
            >
              Add to Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardImport;
