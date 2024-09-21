'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw, BookOpen, Pencil } from 'lucide-react';

interface ModeSelectionProps {
  onSelectMode: (mode: string, frontSide: string) => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectMode }) => {
  const [frontSide, setFrontSide] = useState('spanish');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <CardContent>
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Choose Your Study Mode</h1>
          <div className="mb-8">
            <Button 
              onClick={() => setFrontSide(prev => prev === 'english' ? 'spanish' : 'english')} 
              className="w-full bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
            >
              <RotateCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Front side: {frontSide === 'english' ? 'English' : 'Spanish'}
            </Button>
          </div>
          <div className="space-y-4">
            <Button 
              onClick={() => onSelectMode('flashcard', frontSide)} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              Flashcard Mode
            </Button>
            <Button 
              onClick={() => onSelectMode('writing', frontSide)} 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
              Writing Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};