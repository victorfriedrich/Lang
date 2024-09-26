'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import Reader from './Reader';
import UrlParser from './UrlParser';
import ArticleList from './ArticleList';
import LanguageLevelSelector from './LanguageLevelSelector';
import YouTubeVideoGrid from './YouTubeVideoGrid';
import ProficiencyPage from '../get-started/page';

const AppClient: React.FC = () => {
  const pathname = usePathname();

  const handleTranslationAdded = (group: any, translations: any[]) => {
    // Handle the added translation
    console.log('Translation added:', group, translations);
  };

  const handleSentenceComplete = () => {
    // Handle completion of all sentences
    console.log('All sentences completed');
  };

  const renderContent = () => {
    switch (pathname) {
      case '/':
      case '/articles':
        return <ArticleList />;
      case '/parse':
        return <UrlParser />;
      case '/ranking':
        return <YouTubeVideoGrid />;
      case '/get-started':
        return <ProficiencyPage />;
      default:
        if (pathname?.startsWith('/read/')) {
          const articleId = pathname.split('/').pop();
          return (
            <Reader
              articleId={articleId || ''}
              onTranslationAdded={handleTranslationAdded}
              onSentenceComplete={handleSentenceComplete}
            />
          );
        }
        return <ArticleList />; // Default route
    }
  };

  return renderContent();
};

export default AppClient;