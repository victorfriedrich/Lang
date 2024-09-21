import React from 'react';
import { FlashCardContent } from './FlashCardContent';
import { FlashCardInteraction } from './FlashCardInteraction';
import { useMediaQuery } from 'usehooks-ts'
import { motion } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';

interface FlashCardProps {
    card: { word: string; translation: string };
    isFlipped: boolean;
    frontSide: 'spanish' | 'english';
    feedback: 'correct' | 'incorrect' | null;
    onFlip: () => void;
    onSwipe: (result: 'correct' | 'incorrect', wasFlipped: boolean) => void;
    waitForNextButton: boolean;
    onNext: () => void;
    showNextCard: boolean;
    isNextCard?: boolean;
}

export const FlashCard: React.FC<FlashCardProps> = ({
    isNextCard = false,
    ...props
}) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const borderColor = props.feedback === 'correct' ? 'green' : props.feedback === 'incorrect' ? 'red' : 'transparent';

    return (
        <div className={`w-full max-w-md h-64 perspective-1000 ${isNextCard ? 'pointer-events-none' : ''}`}>
            <FlashCardInteraction
                isDesktop={isDesktop}
                isFlipped={props.isFlipped}
                onFlip={props.onFlip}
                onSwipe={props.onSwipe}
                waitForNextButton={props.waitForNextButton}
                onNext={props.onNext}
                showNextCard={props.showNextCard}
                isNextCard={isNextCard}
            >
                <FlashCardContent
                    {...props}
                    borderColor={borderColor}
                    hideNextCard={props.isFlipped}
                    isNextCard={isNextCard}
                />
            </FlashCardInteraction>
        </div>
    );
};
