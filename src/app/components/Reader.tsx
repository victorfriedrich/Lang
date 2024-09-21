import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronRight, Book, List } from 'lucide-react';
import { useRouter } from 'next/router';

interface Group {
  type: string;
  content: string;
  key?: string;
  score?: number;
}

interface Translation {
  text: string;
  explanation: string;
}

interface ReaderProps {
  articleId: string;
  onTranslationAdded?: (group: Group, translations: Translation[]) => void;
  onSentenceComplete?: () => void;
}

export default function Reader({ articleId, onTranslationAdded, onSentenceComplete }: ReaderProps) {
  const [sentences, setSentences] = useState<Group[][]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [translationList, setTranslationList] = useState<{ group: Group; translations: Translation[] }[]>([]);
  const [includeExplanations, setIncludeExplanations] = useState(false);
  const [activeTab, setActiveTab] = useState('translate');
  const [translationOptions, setTranslationOptions] = useState<Translation[] | null>(null);
  const [selectedTranslations, setSelectedTranslations] = useState<string[]>([]);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentenceRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSentences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/article/${articleId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        const data = await response.json();
        setSentences([data.scored_article]); // Wrap in array as we expect an array of sentences
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load article. Please try again.');
        setIsLoading(false);
      }
    };

    fetchSentences();
  }, [articleId]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && selectedGroup) {
        handleAddTranslation();
      } else if (event.key === 'ArrowRight') {
        handleNextSentence();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedGroup, selectedTranslations]);

  const handleGroupClick = async (group: Group, event: React.MouseEvent) => {
    if (group.type === 'name') return; // Names are not selectable

    if (group.content !== selectedGroup?.content) {
      const rect = event.currentTarget.getBoundingClientRect();
      const sentenceRect = sentenceRef.current?.getBoundingClientRect();
      if (sentenceRect) {
        setPopupPosition({
          top: rect.bottom - sentenceRect.top,
          left: rect.left - sentenceRect.left,
        });
      }
      setSelectedGroup(group);
      setSelectedTranslations([]);
      await fetchTranslations(group);
    } else {
      setSelectedGroup(null);
      setTranslationOptions(null);
    }
  };

  const fetchTranslations = async (group: Group) => {
    // TODO: Replace this with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockTranslations = [
      { text: `Translation 1`, explanation: "Explanation 1" },
      { text: `Translation 2`, explanation: "Explanation 2" },
      { text: `Translation 3`, explanation: "Explanation 3" },
    ];
    setTranslationOptions(mockTranslations);
  };

  const handleTranslationToggle = (translation: string) => {
    setSelectedTranslations(prev => 
      prev.includes(translation)
        ? prev.filter(t => t !== translation)
        : [...prev, translation]
    );
  };

  const handleAddTranslation = () => {
    if (selectedGroup && selectedTranslations.length > 0 && translationOptions) {
      const newTranslations = selectedTranslations.map(t => ({
        text: t,
        explanation: includeExplanations 
          ? translationOptions.find(option => option.text === t)!.explanation 
          : ''
      }));

      setTranslationList(prev => {
        const existingIndex = prev.findIndex(item => item.group.content === selectedGroup.content);
        if (existingIndex !== -1) {
          const updatedList = [...prev];
          updatedList[existingIndex] = {
            group: selectedGroup,
            translations: [...prev[existingIndex].translations, ...newTranslations]
          };
          return updatedList;
        } else {
          return [...prev, { group: selectedGroup, translations: newTranslations }];
        }
      });

      if (onTranslationAdded) {
        onTranslationAdded(selectedGroup, newTranslations);
      }

      setSelectedGroup(null);
      setTranslationOptions(null);
      setSelectedTranslations([]);
    }
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prevIndex => prevIndex + 1);
    } else if (onSentenceComplete) {
      onSentenceComplete();
    }
    setSelectedGroup(null);
    setTranslationOptions(null);
    setSelectedTranslations([]);
  };

  const getGroupColor = (group: Group) => {
    if (group.type === 'name') return 'text-black';
    if (group.score === undefined) return 'text-red-500';
    if (group.score >= 80) return 'text-green-500';
    if (group.score >= 60) return 'text-blue-500';
    if (group.score >= 40) return 'text-yellow-500';
    if (group.score >= 20) return 'text-orange-300';
    return 'text-red-500';
  };

  const renderSentence = (sentence: Group[]) => {
    return sentence.map((group, index) => {
      if (group.type === "char") {
        return (
          <React.Fragment key={index}>
            <span>{group.content}</span>
            {group.content === '.' && ' '}
          </React.Fragment>
        );
      }
      const groupColor = getGroupColor(group);
      const nextGroup = sentence[index + 1];
      const addSpace = nextGroup && nextGroup.type !== "char";
      
      return (
        <React.Fragment key={index}>
          <span
            className={`${group.type !== 'name' ? 'cursor-pointer' : ''} ${groupColor} border-b
            ${selectedGroup?.content === group.content ? 'bg-blue-100' : ''}`}
            onClick={(e) => handleGroupClick(group, e)}
          >
            {group.content}
          </span>
          {addSpace && ' '}
        </React.Fragment>
      );
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-12 bg-gray-800 flex flex-col items-center py-4">
        <button
          onClick={() => setActiveTab('translate')}
          className={`w-8 h-8 mb-4 flex items-center justify-center rounded ${activeTab === 'translate' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          <Book size={18} color="white" />
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`w-8 h-8 flex items-center justify-center rounded ${activeTab === 'list' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          <List size={18} color="white" />
        </button>
      </div>

      <div className="flex-1 p-8">
        {activeTab === 'translate' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6 text-lg leading-relaxed relative" ref={sentenceRef}>
              {sentences[currentSentenceIndex] && renderSentence(sentences[currentSentenceIndex])}
              {selectedGroup && translationOptions && (
                <div 
                  className="absolute bg-white border border-gray-300 rounded shadow-lg p-2 z-10 text-sm"
                  style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px`, maxWidth: '250px' }}
                >
                  <div className="max-h-48 overflow-y-auto">
                    {translationOptions.map(({ text, explanation }, index) => (
                      <div 
                        key={index} 
                        className={`p-1 border rounded cursor-pointer relative mb-1
                                    ${selectedTranslations.includes(text) ? 'border-blue-500' : 'border-gray-300'}
                                    hover:border-blue-300 transition-colors duration-200`}
                        onClick={() => handleTranslationToggle(text)}
                      >
                        <div className="font-medium">{text}</div>
                        <div className="text-xs text-gray-500">{explanation}</div>
                        {selectedTranslations.includes(text) && (
                          <Check className="absolute top-1 right-1 text-blue-500" size={12} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <label className="flex items-center text-xs">
                      <input
                        type="checkbox"
                        checked={includeExplanations}
                        onChange={(e) => setIncludeExplanations(e.target.checked)}
                        className="mr-1"
                      />
                      Include explanations
                    </label>
                    <button 
                      className={`py-1 px-2 rounded text-xs ${selectedTranslations.length > 0
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                        transition-colors duration-200`}
                      onClick={handleAddTranslation}
                      disabled={selectedTranslations.length === 0}
                    >
                      Add Translation
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end items-center space-x-2">
              <button 
                className="p-2 rounded bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-200 flex items-center justify-center"
                onClick={handleNextSentence}
                title="Next Sentence"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Translation List</h2>
            <ul className="space-y-2">
              {translationList.map((item, index) => (
                <li key={index} className="border-b pb-2">
                  <strong>{item.group.content}:</strong> {item.translations.map((t, i) => (
                    <span key={t.text}>
                      {i > 0 && ", "}
                      {t.text}
                      {t.explanation && <span className="text-gray-500 text-sm"> ({t.explanation})</span>}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}