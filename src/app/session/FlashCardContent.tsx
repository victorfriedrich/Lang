import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './FlashCardContent.css'; // Import the CSS file

interface FlashCardContentProps {
  card: { word: string; translation: string };
  isFlipped: boolean;
  frontSide: 'spanish' | 'english';
  feedback: 'correct' | 'incorrect' | null;
  borderColor: any;
  showNextCard: boolean;
  isNextCard?: boolean;
  hideNextCard: boolean;
}

export const FlashCardContent: React.FC<FlashCardContentProps> = ({
  card,
  isFlipped,
  frontSide,
  feedback,
  borderColor,
  showNextCard,
  isNextCard = false,
  hideNextCard,
}) => (
  <motion.div
    className={`absolute inset-0 w-full h-full focus:outline-none ${isNextCard ? (hideNextCard ? 'opacity-0' : 'opacity-50') : ''}`}
    animate={{
      rotateY: isFlipped ? 180 : 0,
      scale: isNextCard ? 0.9 : 1,
    }}
    transition={{ duration: 0.4 }}
    style={{
      transformStyle: 'preserve-3d',
      WebkitTransformStyle: 'preserve-3d', // Safari
    }}
  >
    {/* Front Side */}
    <Card className="absolute w-full h-full bg-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] front-side backface-hidden focus:outline-none">
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{ borderWidth: 4, borderStyle: 'solid', borderColor }}
      />
      <CardContent className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          animate={{ opacity: isFlipped ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="h-20 flex items-center justify-center">
            <h2 className="text-3xl font-bold text-gray-800">
              {frontSide === 'spanish' ? card.word : card.translation}
            </h2>
          </div>
          {feedback === 'incorrect' && !isNextCard && (
            <div className="text-red-500 mt-4 flex items-center">
              <XCircle className="h-4 w-4 mr-2" aria-hidden="true" />
              <p>Correct answer: {frontSide === 'spanish' ? card.translation : card.word}</p>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>

    {/* Back Side */}
    {!isNextCard && (
      <Card
        className="absolute w-full h-full bg-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] back-side backface-hidden"
        style={{
          transform: 'rotateY(180deg)',
          WebkitTransform: 'rotateY(180deg)', // Safari
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{ borderWidth: 4, borderStyle: 'solid', borderColor }}
        />
        <CardContent className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isFlipped ? 1 : 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <div className="h-20 flex items-center justify-center">
              <h2 className="text-3xl font-bold text-gray-800">
                {frontSide === 'spanish' ? card.translation : card.word}
              </h2>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    )}
  </motion.div>
);
