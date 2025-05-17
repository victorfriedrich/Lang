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
  disabled: boolean;
}

const languageOptions: LanguageOption[] = [
  { code: 'es', name: 'Spanish', disabled: false },
  { code: 'it', name: 'Italian', disabled: false },
  { code: 'de', name: 'German', disabled: false },
  { code: 'fr', name: 'French', disabled: false },
  { code: 'ru', name: 'Russian', disabled: true },
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

        setTimeout(() => {
          if (onComplete) {
            console.log("Y")
            onComplete();
            initializeLanguage(selectedLanguage.code, selectedLevel.level);
          } else {
            // Default behavior - redirect to videos
            router.push('/videos');
          }
        }, 1500);

        
        
        // Update the context with the new language
        setLanguage({
          code: selectedLanguage.code,
          name: selectedLanguage.name,
          flag: selectedLanguage.code // for backward compatibility
        });
        
        setIsComplete(true);
        
        // Wait a moment to show success message, then proceed
        
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="max-w-xl w-full mx-auto">
        <div className="w-full flex flex-col min-h-screen">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
      {isComplete ? (
        <div className="flex flex-col py-8">
          <CheckCircle size={48} className="text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {selectedLanguage?.name} successfully set up!
          </h2>
          <p className="text-gray-500">
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
              <h2 className="text-2xl font-bold mb-2">Add a New Language</h2>
              <p className="mb-5 text-gray-500">
                Choose which language you'd like to add to your learning journey.
              </p>
              <div className="flex flex-col gap-4">
                {languageOptions.map((language) => (
                  <button
                    key={language.code}
                    className={`flex items-center p-4 rounded-lg cursor-pointer w-full text-left
                      ${
                        selectedLanguage?.code === language.code
                          ? 'border-2 border-orange-400'
                          : 'border border-gray-200 hover:border-gray-300'
                      }
                      ${language.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    style={{
                      borderWidth: selectedLanguage?.code === language.code ? '2px' : '1px',
                      margin: selectedLanguage?.code === language.code ? '0px' : '1px'
                    }}
                    onClick={() => handleLanguageSelect(language)}
                    disabled={language.disabled}
                  >
                    <div className="w-8 h-6 mr-4 overflow-hidden rounded-md flex-shrink-0">
                      <img 
                        src={`https://flagcdn.com/w80/${language.code}.png`} 
                        alt={`${language.name} flag`}
                        className="w-full h-full object-cover"
                      />
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
              <h2 className="text-2xl font-bold mb-4">How good is your {selectedLanguage?.name}?</h2>
              <p className="text-gray-600 mb-6">Based on your selection, we'll customize your experience. You can always adjust this later.</p>
              <div className="space-y-3">
                {levels.map(level => (
                  <button
                    key={level.level}
                    onClick={() => handleLevelSelect(level)}
                    disabled={isInitializing}
                    className={`w-full text-left p-4 rounded-xl shadow-sm ${
                      selectedLevel?.level === level.level
                        ? 'border-2 border-orange-400'
                        : 'border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-bold">{level.level}</span>
                    <p className="text-gray-600 text-sm">{level.description}</p>
                  </button>
                ))}
              </div>
            </>
          )}


        </>
      )}
          </div>
          <div className="p-4 md:p-6">
            <button 
              onClick={handleNext}
              className={`w-full py-3 rounded-xl font-bold text-white text-lg shadow-sm ${
                ((step === 1 && selectedLanguage) || (step === 2 && selectedLevel)) && !isInitializing
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-gray-300'
              }`}
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
                step === 2 ? 'Add Language' : 'Next'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSetup;