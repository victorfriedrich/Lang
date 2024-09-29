import { useTutorialContext } from '@/context/TutorialContext';

const useTutorial = () => {
  const { addTutorial } = useTutorialContext();

  const showAddedWordsTutorial = (count: number) => {
    addTutorial(
      `We've added ${count} word${count > 1 ? 's' : ''} to your vocabulary. Find them here.`,
      '/vocabulary'
    );
  };

  return {
    showAddedWordsTutorial,
  };
};

export default useTutorial;