'use client';

import React, { useState, useCallback } from 'react';
import { ModeSelection } from './ModeSelection';
import { FlashcardSession } from './FlashcardSession';

const Flashcards = () => {
  const [mode, setMode] = useState(null);
  const [frontSide, setFrontSide] = useState('spanish');

  const handleModeSelect = useCallback((selectedMode, selectedFrontSide) => {
    setMode(selectedMode);
    setFrontSide(selectedFrontSide);
  }, []);

  const handleSessionExit = useCallback(() => {
    setMode(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {mode === null ? (
        <ModeSelection onSelectMode={handleModeSelect} />
      ) : (
        <FlashcardSession 
          key={`${mode}-${frontSide}`} 
          mode={mode} 
          frontSide={frontSide} 
          onExit={handleSessionExit} 
        />
      )}
    </div>
  );
};

export default Flashcards;