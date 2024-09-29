'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import UrlParser from './UrlParser';
import ArticleList from './ArticleList';
import LanguageLevelSelector from './LanguageLevelSelector';
import YouTubeVideoGrid from './YouTubeVideoGrid';
import ProficiencyPage from '../get-started/page';
import ProtectedRoute from './ProtectedRoute';
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
        return <ProtectedRoute><ArticleList /></ProtectedRoute>;
      case '/parse':
        return <UrlParser />;
      case '/ranking':
        return <ProtectedRoute><YouTubeVideoGrid /></ProtectedRoute>;
      case '/get-started':
        return <ProficiencyPage />;
      default:
        return <ProtectedRoute><ArticleList /></ProtectedRoute>; // Default route
    }
  };

  return renderContent();
};

export default AppClient;