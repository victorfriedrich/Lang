import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface FlashCardInteractionProps {
    isDesktop: boolean;
    isFlipped: boolean;
    onFlip: () => void;
    onSwipe: (result: 'correct' | 'incorrect', wasFlipped: boolean) => void;
    waitForNextButton: boolean;
    onNext: () => void;
    children: React.ReactNode;
    showNextCard: boolean;
    isNextCard: boolean;
}

export const FlashCardInteraction: React.FC<FlashCardInteractionProps> = ({
    isDesktop,
    isFlipped,
    onFlip,
    onSwipe,
    waitForNextButton,
    onNext,
    children,
    showNextCard,
    isNextCard,
}) => {
    console.log('FlashCardInteraction rendered, isDesktop:', isDesktop);
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-100, 100], [-10, 10]);
    const borderColor = useTransform(
        x,
        [-100, 0, 100],
        ['#ef4444', '#e5e7eb', '#22c55e']
    );

    const handleDragEnd = (_, info: any) => {
        if (!isDesktop) {
            if (info.offset.x > 100) {
                onSwipe('correct', isFlipped);
                x.set(window.innerWidth);
            } else if (info.offset.x < -100) {
                onSwipe('incorrect', isFlipped);
                x.set(-window.innerWidth);
            } else {
                animate(x, 0, { type: "spring", duration: 0.2 });
            }
        }
    };

    const handleButtonClick = (direction: 'left' | 'right') => {
        const targetX = direction === 'left' ? -30 : 30;
        const targetOpacity = 0.2;
        
        onSwipe(direction === 'left' ? 'incorrect' : 'correct', isFlipped);
        
        animate(x, targetX, {
            type: "ease",
            duration: 0.4,
        });
        
        setTimeout(() => {
            animate(x, 0, { duration: 0.2 });
        }, 300);
    };

    return (
        <>
            <motion.div
                drag={isDesktop ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                style={{ x, rotate: isDesktop ? 0 : rotate }}
                onDragEnd={handleDragEnd}
                className="relative w-full h-full cursor-grab active:cursor-grabbing"
                whileTap={{ cursor: isDesktop ? 'default' : 'grabbing' }}
                onClick={onFlip}
            >
                {React.Children.map(children, child =>
                    React.cloneElement(child as React.ReactElement, { borderColor, showNextCard })
                )}
            </motion.div>
            {isDesktop && !waitForNextButton && !isNextCard && (
                <div className="mt-4 flex justify-between items-center w-full">
                    <Button onClick={() => handleButtonClick('left')} variant="outline" className="w-[35%]">
                        Don't Know
                    </Button>
                    <div className="w-[10%]"></div>
                    <Button onClick={() => handleButtonClick('right')} className="w-[35%]">
                        Know
                    </Button>
                </div>
            )}
            {waitForNextButton && !isNextCard && (
                <div className="mt-4 flex justify-center items-center w-full">
                    <Button onClick={onNext} className="w-full">
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </>
    );
};
