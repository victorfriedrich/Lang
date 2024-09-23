import { StreakData } from '../types/streakTypes';

// Function to calculate days until repeat
export const calculateDaysUntilRepeat = (dueDate: string | null): number | null => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays < 0 ? 0 : diffDays;
};

// Function to get words due today
export const getWordsDueToday = (words: any[]): any[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return words.filter(word => {
    const daysUntilRepeat = calculateDaysUntilRepeat(word.next_review_due_at);
    return daysUntilRepeat === 0;
  });
};

// Function to generate streak data
export function generateStreakData(practiceDates: any[], referenceDate: Date): StreakData[] {
  const twoWeeksAgo = new Date(referenceDate);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);

  const streakData: StreakData[] = [];

  for (let i = 0; i < 14; i++) {
    const currentDate = new Date(twoWeeksAgo);
    currentDate.setDate(currentDate.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];

    const practiceEntry = practiceDates.find(entry => entry.revision_date === dateString);

    streakData.push({
      date: dateString,
      wordsReviewed: practiceEntry ? practiceEntry.revision_count : 0
    });
  }

  return streakData;
};

// Function to get days until review
export const getDaysUntilReview = (reviewDate: string) => {
  const today = new Date();
  const review = new Date(reviewDate);
  const diffTime = review.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
