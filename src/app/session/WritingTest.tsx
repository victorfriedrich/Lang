'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XCircle } from 'lucide-react';

interface WritingTestProps {
  card: { word: string; translation: string };
  frontSide: 'spanish' | 'english';
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  feedback: 'correct' | 'incorrect' | null;
}

export const WritingTest: React.FC<WritingTestProps> = ({ 
  card, 
  frontSide, 
  inputValue, 
  onInputChange, 
  onSubmit, 
  feedback 
}) => (
  <Card className="w-full max-w-md p-6 shadow-md">
    <CardContent>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {frontSide === 'spanish' ? card.word : card.translation}
      </h2>
      <Input
        type="text"
        value={inputValue}
        onChange={onInputChange}
        placeholder={`Type the ${frontSide === 'spanish' ? 'English' : 'Spanish'} translation`}
        className="mb-4"
      />
      <Button onClick={onSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Submit</Button>
      {feedback === 'incorrect' && (
        <div className="mt-4 text-red-500 flex items-center">
          <XCircle className="h-4 w-4 mr-2" aria-hidden="true" />
          <p>Correct answer: {frontSide === 'spanish' ? card.translation : card.word}</p>
        </div>
      )}
    </CardContent>
  </Card>
);
