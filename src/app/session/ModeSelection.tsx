'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw, BookOpen, Pencil } from 'lucide-react';

interface ModeSelectionProps {
  onSelectMode: (mode: string, frontSide: string) => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectMode }) => {
  const [frontSide, setFrontSide] = useState('english');

  return (
    <div className="flex flex-col items-start justify-start min-h-screen bg-white">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Choose Your Study Mode</h1>
        <div className="mb-8">
          <Button 
            onClick={() => setFrontSide(prev => prev === 'english' ? 'spanish' : 'english')} 
            className="w-full bg-white text-black border-2 border-black hover:bg-gray-100 py-6"
            variant="outline"
          >
            <RotateCw className="mr-2 h-5 w-5" aria-hidden="true" />
            Front side: {frontSide === 'english' ? 'English' : 'Spanish'}
          </Button>
        </div>
        <div className="space-y-4">
          <Button 
            onClick={() => onSelectMode('flashcard', frontSide)} 
            className="w-full bg-black hover:bg-gray-800 text-white py-6"
          >
            <BookOpen className="mr-2 h-5 w-5" aria-hidden="true" />
            Flashcard Mode
          </Button>
          <Button 
            onClick={() => onSelectMode('writing', frontSide)} 
            className="w-full bg-black hover:bg-gray-800 text-white py-6"
          >
            <Pencil className="mr-2 h-5 w-5" aria-hidden="true" />
            Writing Mode
          </Button>
        </div>
      </div>
    </div>
  );
};