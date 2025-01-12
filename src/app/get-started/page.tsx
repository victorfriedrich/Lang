'use client';

import React, { useState, useEffect, useContext } from 'react';
import {
  Earth,
  KeyRound,
  NotebookPen,
  Footprints,
  ArrowLeft,
} from 'lucide-react';
import proficiencyData from '../proficiency.json';
import levelsData from '../levels.json';
import { useCreateDemoAccount } from '../hooks/useCreateDemoAccount';
import { useInitializeAccount } from '../hooks/useInitializeAccount';
import { useRouter } from 'next/navigation';
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

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  disabled: boolean;
}

const languageOptions: LanguageOption[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸', disabled: false },
  { code: 'it', name: 'Italian', flag: '🇮🇹', disabled: false },
  { code: 'de', name: 'German', flag: '🇩🇪', disabled: false },
  { code: 'fr', name: 'French', flag: '🇫🇷', disabled: true },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', disabled: true },
];

const languageLevelIcons = [
  Footprints,
  KeyRound,
  NotebookPen,
  Earth,
];

const ProficiencyPage: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel | null>(null);
  const [knownWords, setKnownWords] = useState<number[]>([]);
  const [proficiencyItems, setProficiencyItems] = useState<ProficiencyItem[]>([]);
  const levels: LanguageLevel[] = levelsData as LanguageLevel[];
  const { createDemoAccount, isLoading, user } = useCreateDemoAccount();
  const { initializeUserAccount } = useInitializeAccount();
  const router = useRouter();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const { setLanguage: setContextLanguage, language: contextLanguage } = useContext(UserContext);

  useEffect(() => {
    if (Array.isArray(proficiencyData)) {
      setProficiencyItems(proficiencyData as ProficiencyItem[]);
    }
  }, []);

  useEffect(() => {
    if (user && user.is_anonymous) {
      router.push('/videos');
    }
  }, [user, router]);

  const handleLanguageSelect = (language: LanguageOption) => {
    if (!language.disabled) {
      setSelectedLanguage(language);
      setContextLanguage(language);
      localStorage.setItem('app-language', JSON.stringify(language));
    }
  };

  const handleLevelSelect = (level: LanguageLevel) => {
    setSelectedLevel(level);
  };

  const handleNext = () => {
    if (step === 1 && selectedLanguage) {
      setStep(2);
    } else if (step === 2 && selectedLevel) {
      setKnownWords(selectedLevel.words);
      handleCreateDemoAccount();
    }
  };

  const handleCreateDemoAccount = async () => {
    if (selectedLanguage && selectedLevel) {
      setIsCreatingAccount(true);
      try {
        const demoUser = await createDemoAccount({
          language: selectedLanguage.code,
          level: selectedLevel.level,
        });
        console.log('Demo account created:', demoUser);
        await initializeUserAccount(
          selectedLanguage.name,
          selectedLevel.level
        );
        router.push('/videos');
      } catch (error) {
        console.error('Error creating or initializing demo account:', error);
        alert('An error occurred. Please try again.');
        setIsCreatingAccount(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100">
      <div className="w-full max-w-xl p-4 md:p-6 overflow-y-auto relative">
        <div className="flex justify-between items-center mb-3">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <ArrowLeft size={20} className="mr-1" />
              <span className="text-sm font-medium">Back</span>
            </button>
          ) : (
            <div></div>
          )}
        </div>

        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-3">Select Your Language</h2>
            <div className="flex flex-col gap-4">
              {languageOptions.map((language) => (
                <button
                  key={language.code}
                  className={`flex items-center p-4 bg-white rounded-lg cursor-pointer w-full text-left
                    ${
                      selectedLanguage?.code === language.code
                        ? 'ring-2 ring-blue-500'
                        : 'ring-1 ring-gray-200'
                    }
                    ${language.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => handleLanguageSelect(language)}
                  disabled={language.disabled}
                >
                  <div className="flex w-12 h-12 bg-gray-200 rounded-full mr-4 flex-shrink-0 items-center justify-center text-2xl">
                    {language.flag}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{language.name}</h3>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={handleNext}
              className={`mt-6 w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                selectedLanguage
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              disabled={!selectedLanguage}
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-2">How good is your {selectedLanguage?.name}?</h2>
            <p className="mb-5 text-gray-500">Based on your selection you'll start off with a list of most common words that are used to find videos. You can always change this later.</p>
            <div className="flex flex-col gap-4">
              {levels.map((level, index) => {
                const Icon = languageLevelIcons[index] || Earth;
                return (
                  <button
                    key={level.level}
                    className={`flex items-center p-4 bg-white rounded-lg cursor-pointer w-full text-left
                      ${
                        selectedLevel?.level === level.level
                          ? 'ring-2 ring-blue-500'
                          : 'ring-1 ring-gray-200'
                      }`}
                    onClick={() => handleLevelSelect(level)}
                  >
                    <div className="flex w-12 h-12 bg-gray-200 rounded-full mr-4 flex-shrink-0 items-center justify-center">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{level.level}</h3>
                      <p className="text-gray-600 text-xs">
                        {level.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleNext}
              className={`mt-6 w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                selectedLevel
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              disabled={!selectedLevel}
            >
              Complete Setup
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProficiencyPage;
