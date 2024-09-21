import React from 'react';
import { FlashCardContent } from './FlashCardContent';
import { FlashCardInteraction } from './FlashCardInteraction';
import { useMediaQuery } from 'usehooks-ts'

interface FlashCardProps {
    card: { word: string; translation: string };
    isFlipped: boolean;
    frontSide: 'spanish' | 'english';
    feedback: 'correct' | 'incorrect' | null;
    onFlip: () => void;
    onSwipe: (result: 'correct' | 'incorrect', wasFlipped: boolean) => void;
    waitForNextButton: boolean;
    onNext: () => void;
}

export const FlashCard: React.FC<FlashCardProps> = (props) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const borderColor = props.feedback === 'correct' ? 'green' : props.feedback === 'incorrect' ? 'red' : 'transparent';

    return (
        <div className="w-full max-w-md h-64 perspective-1000">
            <FlashCardInteraction
                isDesktop={isDesktop}
                isFlipped={props.isFlipped}
                onFlip={props.onFlip}
                onSwipe={props.onSwipe}
                waitForNextButton={props.waitForNextButton}
                onNext={props.onNext}
            >
                <FlashCardContent
                    {...props}
                    borderColor={borderColor}
                />
            </FlashCardInteraction>
        </div>
    );
};
