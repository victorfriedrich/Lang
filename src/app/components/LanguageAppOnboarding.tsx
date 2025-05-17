'use client';

import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import levelsData from '../levels.json';
import { useCreateDemoAccount } from '../hooks/useCreateDemoAccount';

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

interface LanguageAppOnboardingProps {
  onComplete?: () => void;
  isNewAccount?: boolean;
  defaultLanguageCode?: string;
}

const LanguageAppOnboarding: React.FC<LanguageAppOnboardingProps> = ({
  onComplete,
  isNewAccount = false,
  defaultLanguageCode
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, initializeLanguage, setLanguage } = useContext(UserContext);
  const { createDemoAccount, isLoading: isCreatingDemoAccount } = useCreateDemoAccount();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<{ id: string; name: string }[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const levels: LanguageLevel[] = levelsData as LanguageLevel[];

  // Available languages
  const languages: LanguageOption[] = [
    { code: 'es', name: 'Spanish', disabled: false },
    { code: 'de', name: 'German', disabled: false },
    { code: 'it', name: 'Italian', disabled: false },
    { code: 'fr', name: 'French', disabled: false },
    { code: 'ru', name: 'Russian', disabled: true },
  ];

  // Content interests
  const interests = [
    { id: 'movies', name: 'Movies & TV', icon: '🎬' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'news', name: 'News', icon: '📰' },
    { id: 'travel', name: 'Travel', icon: '✈️' },
    { id: 'cooking', name: 'Cooking', icon: '🍳' },
    { id: 'tech', name: 'Technology', icon: '💻' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'education', name: 'Education', icon: '📚' },
  ];

  // Initialize from URL param or prop
  useEffect(() => {
    const langCode = defaultLanguageCode || searchParams.get('language');
    if (langCode) {
      const matchedLanguage = languages.find(
        lang => lang.code === langCode && !lang.disabled
      );
      if (matchedLanguage) {
        setSelectedLanguage(matchedLanguage);
        setCurrentStep(2); // Skip to level selection
      }
    }
  }, [searchParams, defaultLanguageCode]);

  const handleNext = () => setCurrentStep(currentStep + 1);
  const handleBack = () => setCurrentStep(currentStep - 1);

  const toggleInterest = (interest: { id: string; name: string }) => {
    if (selectedInterests.some(i => i.id === interest.id)) {
      setSelectedInterests(selectedInterests.filter(i => i.id !== interest.id));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleLanguageSelect = (language: LanguageOption) => {
    if (!language.disabled) {
      setSelectedLanguage(language);
    }
  };

  const handleLevelSelect = (level: LanguageLevel) => {
    setSelectedLevel(level);
  };

  const handleInitializeLanguage = async () => {
    if (selectedLanguage && selectedLevel) {
      setIsInitializing(true);
      try {
        // Create the demo account if no non-anonymous user exists
        if (!user || user.is_anonymous) {
          await createDemoAccount({
            language: selectedLanguage.code,
            level: selectedLevel.level,
          });
        }
        // Initialize the language for the account
        await initializeLanguage(selectedLanguage.code, selectedLevel.level);
        // Update the context with the new language
        setLanguage({
          code: selectedLanguage.code,
          name: selectedLanguage.name,
          flag: selectedLanguage.code,
        });
        setIsComplete(true);
        // After a brief delay, call onComplete or redirect
        if (onComplete) {
            onComplete();
          } else {
            router.push('/videos');
          }
      } catch (error) {
        console.error('Error initializing language:', error);
        alert('An error occurred while setting up the language. Please try again.');
        setIsInitializing(false);
      }
    }
  };

  const LanguageSelection = () => (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">Select your language</h2>
        {languages.filter(lang => !lang.disabled).map(language => (
          <button
            key={language.code}
            onClick={() => {
              handleLanguageSelect(language);
              handleNext();
            }}
            className="flex items-center p-4 w-full border border-gray-200 rounded-lg shadow-sm mb-3 hover:bg-gray-50"
          >
            <div className="w-8 h-6 mr-4 overflow-hidden rounded-md">
              <img 
                src={`https://flagcdn.com/w80/${language.code}.png`} 
                alt={`${language.name} flag`}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg">{language.name}</span>
            <span className="ml-auto text-gray-400">›</span>
          </button>
        ))}
        {/* Disabled languages */}
        {languages.filter(lang => lang.disabled).map(language => (
          <button
            key={language.code}
            disabled
            className="flex items-center p-4 w-full border border-gray-200 rounded-lg shadow-sm mb-3 opacity-50 cursor-not-allowed"
          >
            <div className="w-8 h-6 mr-4 overflow-hidden rounded-md">
              <img 
                src={`https://flagcdn.com/w80/${language.code}.png`} 
                alt={`${language.name} flag`}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg">{language.name}</span>
            <span className="ml-auto text-gray-400">Coming soon</span>
          </button>
        ))}
      </div>
    </div>
  );

  const KnowledgeLevel = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 flex-1">
        <button onClick={handleBack} className="mb-2 text-gray-500">
          ← Back
        </button>
        <h2 className="text-2xl font-bold mb-4">
          How good is your {selectedLanguage?.name}?
        </h2>
        <p className="text-gray-600 mb-6">
          Based on your selection, we'll customize your experience and add the most common words. You can always adjust this later.
        </p>
        <div className="space-y-3">
          {levels.map(level => (
            <button
              key={level.level}
              onClick={() => {
                handleLevelSelect(level);
                handleNext();
              }}
              className="w-full text-left p-4 border border-gray-200 rounded-xl shadow-sm hover:border-gray-300"
            >
              <span className="font-bold">{level.level}</span>
              <p className="text-gray-600 text-sm">{level.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const InterestSelection = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 flex-1">
        <button onClick={handleBack} className="mb-2 text-gray-500">
          ← Back
        </button>
        <h2 className="text-2xl font-bold mb-3">Select some topics you like</h2>
        <p className="text-gray-600 mb-6">We'll find videos about topics you enjoy</p>
        <div className="flex flex-wrap gap-2.5 mb-6">
          {interests.map(interest => (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest)}
              className={`flex items-center py-2 px-3.5 rounded-full ${
                selectedInterests.some(i => i.id === interest.id) 
                  ? 'border-2 border-orange-400' 
                  : 'border border-gray-200 hover:border-gray-300'
              }`}
              style={{
                borderWidth: selectedInterests.some(i => i.id === interest.id) ? '2px' : '1px',
                margin: selectedInterests.some(i => i.id === interest.id) ? '0px' : '1px'
              }}
            >
              <span className="text-xl mr-2">{interest.icon}</span>
              <span className="font-medium">{interest.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        <button 
          onClick={handleInitializeLanguage}
          disabled={isInitializing || selectedInterests.length === 0 || isCreatingDemoAccount}
          className={`w-full py-3 rounded-xl font-bold text-white text-lg shadow-sm ${
            !isInitializing && selectedInterests.length > 0 && !isCreatingDemoAccount 
              ? 'bg-orange-500 hover:bg-orange-600' 
              : 'bg-gray-300'
          }`}
        >
          {isInitializing || isCreatingDemoAccount ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Setting up...
            </span>
          ) : (
            'GET STARTED'
          )}
        </button>
      </div>
    </div>
  );

  const SuccessScreen = () => (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="mb-4 text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {selectedLanguage?.name} successfully set up!
        </h2>
        <p className="text-gray-500">
          Redirecting to content...
        </p>
      </div>
    </div>
  );

  // Render the current step
  const renderStep = () => {
    if (isComplete) {
      return <SuccessScreen />;
    }
    switch (currentStep) {
      case 1:
        return <LanguageSelection />;
      case 2:
        return <KnowledgeLevel />;
      case 3:
        return <InterestSelection />;
      default:
        return <LanguageSelection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative overflow-hidden">
      <div className="flex flex-grow max-w-xl w-full z-10">
        {/* Onboarding interface */}
        <div className="w-full bg-white flex flex-col min-h-screen shadow-lg">
          {currentStep > 1 && currentStep < 4 && !isComplete && (
            <div className="w-full h-1 bg-gray-100">
              <div 
                className="h-full bg-orange-500 transition-all duration-300" 
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {renderStep()}
          </div>
        </div>
      </div>
  
      {/* Overlay footer */}
      {(currentStep === 1 || currentStep === 2) && !isComplete && (
        <div className="absolute bottom-4 text-sm text-gray-600 z-20">
          Already have an account?{' '}
          <a href="/login" className="text-orange-500 font-semibold hover:underline">
            Sign in
          </a>
        </div>
      )}
    </div>
  );
  

};

export default LanguageAppOnboarding;
