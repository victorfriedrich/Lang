import React, { useEffect } from 'react';
import Link from 'next/link';
import { useTutorialContext } from '@/context/TutorialContext';

const TutorialPopup: React.FC = () => {
  const { tutorials, removeTutorial } = useTutorialContext();

  useEffect(() => {
    if (tutorials.length > 0) {
      const timer = setTimeout(() => {
        removeTutorial(tutorials[0].id);
      }, 5000); // Popup will disappear after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [tutorials, removeTutorial]);

  if (tutorials.length === 0) return null;

  const currentTutorial = tutorials[0];

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg p-4 flex items-center space-x-4">
      <p className="text-sm">{currentTutorial.message}</p>
      <Link href={currentTutorial.link}>
        <a className="text-blue-500 underline text-sm">Go to Vocabulary</a>
      </Link>
      <button onClick={() => removeTutorial(currentTutorial.id)} className="text-gray-500 hover:text-gray-700">
        ✕
      </button>
    </div>
  );
};

export default TutorialPopup;