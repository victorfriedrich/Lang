'use client';

import React, { useState, useEffect, useContext } from 'react';
import {
  Earth,
  KeyRound,
  NotebookPen,
  Footprints,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserContext } from '@/context/UserContext';
import levelsData from '../levels.json';

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

interface LanguageSetupProps {
  onComplete?: () => void;
  isNewAccount?: boolean;
  defaultLanguageCode?: string;
}

const LanguageSetup: React.FC<LanguageSetupProps> = ({ 
  onComplete, 
  isNewAccount = false,
  defaultLanguageCode
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, initializeLanguage, setLanguage } = useContext(UserContext);
  
  const [step, setStep] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const levels: LanguageLevel[] = levelsData as LanguageLevel[];

  // Initialize from URL param or prop
  useEffect(() => {
    const langCode = defaultLanguageCode || searchParams.get('language');
    
    if (langCode) {
      const matchedLanguage = languageOptions.find(
        lang => lang.code === langCode && !lang.disabled
      );
      
      if (matchedLanguage) {
        setSelectedLanguage(matchedLanguage);
        setStep(2); // Skip to level selection
      }
    }
  }, [searchParams, defaultLanguageCode]);

  const handleLanguageSelect = (language: LanguageOption) => {
    if (!language.disabled) {
      setSelectedLanguage(language);
    }
  };

  const handleLevelSelect = (level: LanguageLevel) => {
    setSelectedLevel(level);
  };

  const handleNext = () => {
    if (step === 1 && selectedLanguage) {
      setStep(2);
    } else if (step === 2 && selectedLevel) {
      handleInitializeLanguage();
    }
  };

  const handleInitializeLanguage = async () => {
    if (selectedLanguage && selectedLevel) {
      setIsInitializing(true);
      try {
        // Initialize the language
        await initializeLanguage(selectedLanguage.code, selectedLevel.level);
        
        // Update the context with the new language
        setLanguage({
          code: selectedLanguage.code,
          name: selectedLanguage.name,
          flag: selectedLanguage.code
        });
        
        setIsComplete(true);
        
        // Wait a moment to show success message, then proceed
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          } else {
            // Default behavior - redirect to videos
            router.push('/videos');
          }
        }, 1500);
      } catch (error) {
        console.error('Error initializing language:', error);
        alert('An error occurred while setting up the language. Please try again.');
        setIsInitializing(false);
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
      {isComplete ? (
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle size={48} className="text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-center">
            {selectedLanguage?.name} successfully set up!
          </h2>
          <p className="text-gray-500 text-center mt-2">
            Redirecting to content...
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-3">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="text-gray-500 hover:text-gray-700 flex items-center"
                disabled={isInitializing}
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
              <h2 className="text-xl font-bold mb-3">
                Select Your Language
              </h2>
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
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold mb-2">How good is your {selectedLanguage?.name}?</h2>
              <p className="mb-5 text-gray-500">
                Based on your selection, we'll customize your experience. You can always adjust this later.
              </p>
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
                      disabled={isInitializing}
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
            </>
          )}

          <button
            onClick={handleNext}
            className={`mt-6 w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              (step === 1 && selectedLanguage) || (step === 2 && selectedLevel)
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            disabled={
              isInitializing || 
              (step === 1 && !selectedLanguage) || 
              (step === 2 && !selectedLevel)
            }
          >
            {isInitializing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting up...
              </span>
            ) : (
              step === 2 ? 'Complete Setup' : 'Next'
            )}
          </button>
        </>
      )}
      </div>
    </div>
  );
};

export default LanguageSetup;