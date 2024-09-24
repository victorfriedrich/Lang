'use client';

import React, { useState, useEffect, useContext } from 'react';
import {
  Earth,
  KeyRound,
  MessagesSquare,
  NotebookPen,
  Footprints,
} from 'lucide-react';
import proficiencyData from '../proficiency.json';
import levelsData from '../levels.json';
import { useCreateDemoAccount } from '../hooks/useCreateDemoAccount';
import { UserContext } from '@/context/UserContext';

interface ProficiencyItem {
  content: string;
  id?: number | null;
}

interface LanguageLevel {
  level: string;
  description: string;
  words: number[];
}

const languageLevelIcons = [
  Footprints,
  KeyRound,
  NotebookPen,
  MessagesSquare,
  Earth,
];

const LanguageLevelSelector: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel | null>(null);
  const [knownWords, setKnownWords] = useState<number[]>([]);
  const [proficiencyItems, setProficiencyItems] = useState<ProficiencyItem[]>([]);
  const [levels, setLevels] = useState<LanguageLevel[]>([]);
  const { createDemoAccount, isLoading } = useCreateDemoAccount();
  const { user } = useContext(UserContext);

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

  const handleContinue = async () => {
    if (selectedLevel) {
      await createDemoAccount(selectedLevel);
    } else {
      alert('Please select a proficiency level.');
    }
  };

  useEffect(() => {
    if (user) {
      // Redirect to the next page or perform other actions after successful sign-in
      console.log('Demo account created for user:', user);
      // Example: router.push('/dashboard');
    }
  }, [user]);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-gray-100">
      <div className="w-full md:w-1/3 p-4 md:p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-3">How good is your Spanish?</h2>
        <div className="flex flex-wrap gap-2 md:flex-col md:gap-3 mb-6">
          {levels.map((level, index) => {
            const Icon = languageLevelIcons[index] || Earth;
            return (
              <div
                key={level.level}
                className={`flex-1 md:flex-none flex items-center p-2 md:p-3 bg-white rounded-lg cursor-pointer
                  ${
                    selectedLevel?.level === level.level
                      ? 'ring-2 ring-blue-500'
                      : 'ring-1 ring-gray-200'
                  }
                  min-w-[60px] md:min-w-0`}
                onClick={() => handleLevelSelect(level)}
              >
                <div className="hidden md:flex w-10 h-10 bg-gray-200 rounded-full mr-3 flex-shrink-0 items-center justify-center">
                  <Icon size={20} />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-bold text-sm">{level.level}</h3>
                  <p className="hidden md:block text-gray-600 text-xs">
                    {level.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={handleContinue}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Try the demo'}
        </button>
      </div>

      <div className="w-full md:w-2/3 p-4 md:p-6 bg-white overflow-y-auto">
        <h2 className="text-xl font-bold">Example Text</h2>
        <p className="text-gray-600 mb-4">You should know most of the black words</p>
        <div className="text-base leading-relaxed">
          {proficiencyItems.map((item, index) => (
            <span
              key={index}
              className={
                item.id &&
                typeof item.id === 'number' &&
                !knownWords.includes(item.id)
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