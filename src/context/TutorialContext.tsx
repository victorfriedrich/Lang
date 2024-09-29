"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TutorialMessage {
  id: number;
  message: string;
  link: string;
}

interface TutorialContextType {
  tutorials: TutorialMessage[];
  addTutorial: (message: string, link: string) => void;
  removeTutorial: (id: number) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tutorials, setTutorials] = useState<TutorialMessage[]>([]);

  const addTutorial = (message: string, link: string) => {
    const newTutorial: TutorialMessage = {
      id: Date.now(),
      message,
      link,
    };
    setTutorials(prev => [...prev, newTutorial]);
  };

  const removeTutorial = (id: number) => {
    setTutorials(prev => prev.filter(tutorial => tutorial.id !== id));
  };

  return (
    <TutorialContext.Provider value={{ tutorials, addTutorial, removeTutorial }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorialContext = (): TutorialContextType => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorialContext must be used within a TutorialProvider');
  }
  return context;
};