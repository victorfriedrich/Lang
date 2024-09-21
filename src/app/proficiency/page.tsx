'use client';

import React, { useState, useEffect } from 'react';
import { Earth, KeyRound, MessagesSquare, NotebookPen, Footprints } from 'lucide-react';
import proficiencyData from '../proficiency.json';
import levelsData from '../levels.json';

interface ProficiencyItem {
  content: string;
  id?: number | null;
}

interface LanguageLevel {
  level: string;
  description: string;
  words: number[];
}

interface CognateOption {
  language: string;
  flag: string;
  description: string;
}

const cognateOptions: CognateOption[] = [
  { language: 'English', flag: '🇬🇧', description: 'e.g. comunicación (communication), familia (family)' },
  { language: 'French', flag: '🇫🇷', description: 'e.g. interesante (intéressant), posible (possible)' },
];

const languageLevelIcons = [Footprints, KeyRound, NotebookPen, MessagesSquare, Earth];

const LanguageLevelSelector: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel | null>(null);
  const [includeCognates, setIncludeCognates] = useState<string[]>([]);
  const [knownWords, setKnownWords] = useState<number[]>([]);
  const [proficiencyItems, setProficiencyItems] = useState<ProficiencyItem[]>([]);
  const [levels, setLevels] = useState<LanguageLevel[]>([]);

  useEffect(() => {
    if (Array.isArray(proficiencyData)) {
      setProficiencyItems(proficiencyData as ProficiencyItem[]);
    }
    if (Array.isArray(levelsData)) {
      setLevels(levelsData as LanguageLevel[]);
    }
  }, []);

  const handleLevelSelect = (level: LanguageLevel) => {
    setSelectedLevel(level);
    setKnownWords(level.words);
  };

  const handleCognateToggle = (language: string) => {
    setIncludeCognates(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-gray-100">
      <div className="w-full md:w-1/2 p-4 md:p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-3">How good is your Spanish?</h2>
        <div className="flex flex-wrap gap-2 md:flex-col md:gap-3 mb-6">
          {levels.map((level, index) => {
            const Icon = languageLevelIcons[index] || Earth;
            return (
              <div
                key={level.level}
                className={`flex-1 md:flex-none flex items-center p-2 md:p-3 bg-white rounded-lg cursor-pointer
                  ${selectedLevel?.level === level.level ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'}
                  min-w-[60px] md:min-w-0`}
                onClick={() => handleLevelSelect(level)}
              >
                <div className="hidden md:flex w-10 h-10 bg-gray-200 rounded-full mr-3 flex-shrink-0 items-center justify-center">
                  <Icon size={20} />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-bold text-sm">{level.level}</h3>
                  <p className="hidden md:block text-gray-600 text-xs">{level.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="text-xl font-bold mt-4 mb-2">Include cognates?</h2>
        <p className="text-gray-600 text-sm mb-3">
          These are words you might intuitively understand if you speak another language.
        </p>
        <div className="flex flex-wrap gap-2 md:flex-col md:gap-3">
          {cognateOptions.map((option) => (
            <div
              key={option.language}
              className={`flex-1 md:flex-none flex items-center p-2 md:p-3 bg-white rounded-lg cursor-pointer
                ${includeCognates.includes(option.language) ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'}
                min-w-[100px] md:min-w-0`}
              onClick={() => handleCognateToggle(option.language)}
            >
              <span className="text-2xl mr-2 md:mr-3 flex-shrink-0">{option.flag}</span>
              <div>
                <h3 className="font-bold text-sm">{option.language}</h3>
                <p className="hidden md:block text-gray-600 text-xs">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-1/2 p-4 md:p-6 bg-white overflow-y-auto">
        <h2 className="text-xl font-bold mb-3">Example Text</h2>
        <div className="text-base leading-relaxed">
          {proficiencyItems.map((item, index) => (
            <span
              key={index}
              className={
                item.id && typeof item.id === 'number' && !knownWords.includes(item.id)
                  ? 'text-orange-500'
                  : 'text-black'
              }
            >
              {item.content}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageLevelSelector;