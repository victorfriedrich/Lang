import React, { useEffect, useRef, useState } from 'react';

interface Pair {
  word: string;
  translation: string;
}

interface Card {
  id: string;
  text: string;
  type: 'spanish' | 'german';
  matchId: number;
}

interface MemoryMatchGameProps {
  pairs: Pair[];
  onComplete: () => void;
}

const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ pairs, onComplete }) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [gameCards, setGameCards] = useState<Card[]>([]);
  const [cardStates, setCardStates] = useState<Record<string, 'correct' | 'incorrect' | undefined>>({});
  const completedRef = useRef(false);

  useEffect(() => {
    const spanishCards = pairs.map((p, idx) => ({ id: `s-${idx}`, text: p.word, type: 'spanish' as const, matchId: idx }));
    const germanCards = pairs.map((p, idx) => ({ id: `g-${idx}`, text: p.translation, type: 'german' as const, matchId: idx }));
    const shuffledGerman = [...germanCards].sort(() => Math.random() - 0.5);
    setGameCards([...spanishCards, ...shuffledGerman]);
    setSelectedCards([]);
    setMatchedPairs(new Set());
    setCardStates({});
  }, [pairs]);

  const handleCardClick = (card: Card) => {
    if (matchedPairs.has(card.matchId) || selectedCards.find(c => c.id === card.id)) return;

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (first.matchId === second.matchId && first.type !== second.type) {
        setMatchedPairs(prev => new Set([...prev, first.matchId]));
        setSelectedCards([]);
        setCardStates(prev => ({ ...prev, [first.id]: 'correct', [second.id]: 'correct' }));
        setTimeout(() => {
          setCardStates(prev => {
            const n = { ...prev };
            delete n[first.id];
            delete n[second.id];
            return n;
          });
        }, 1000);
      } else {
        setCardStates(prev => ({ ...prev, [first.id]: 'incorrect', [second.id]: 'incorrect' }));
        setTimeout(() => {
          setSelectedCards([]);
          setCardStates(prev => {
            const n = { ...prev };
            delete n[first.id];
            delete n[second.id];
            return n;
          });
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (!completedRef.current && matchedPairs.size === pairs.length && pairs.length > 0) {
      completedRef.current = true;
      onComplete();
    }
  }, [matchedPairs, pairs.length, onComplete]);

  const getCardClassName = (card: Card) => {
    const base = 'p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 text-center font-semibold min-h-16 flex items-center justify-center';
    if (matchedPairs.has(card.matchId)) return `${base} bg-green-200 border-green-500 text-green-800`;
    const state = cardStates[card.id];
    if (state === 'correct') return `${base} bg-green-300 border-green-600 text-green-900 scale-105`;
    if (state === 'incorrect') return `${base} bg-red-300 border-red-600 text-red-900 shake`;
    if (selectedCards.find(c => c.id === card.id)) return `${base} bg-blue-200 border-blue-500 text-blue-800`;
    return `${base} bg-white border-gray-300 text-gray-800 hover:bg-gray-50`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <p className="text-center mb-6 text-gray-600">Match Spanish words with German translations</p>
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          {gameCards.filter(c => c.type === 'spanish').map(card => (
            <div key={card.id} className={getCardClassName(card)} onClick={() => handleCardClick(card)}>
              {card.text}
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {gameCards.filter(c => c.type === 'german').map(card => (
            <div key={card.id} className={getCardClassName(card)} onClick={() => handleCardClick(card)}>
              {card.text}
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default MemoryMatchGame;
