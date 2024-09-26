'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useArticleRecommendations } from '@/app/hooks/useArticleRecommendations';
import { Switch } from '@/components/ui/switch';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/navigation';

const ArticleList: React.FC = () => {
  const [includeCognates, setIncludeCognates] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const { articles, categories, isLoading, error } = useArticleRecommendations(includeCognates, selectedCategory);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        <p>Error: {error}</p>
      </div>
    );
  }

  const handleArticleClick = (articleId: string) => {
    router.push(`/read/${articleId.replace(".json", "")}`);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 relative">
        <h1 className="text-2xl font-bold mb-4">Available Articles</h1>

        <div className='flex justify-between mb-4'>
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category.category}
                onClick={() => setSelectedCategory(category.category)}
                className={`px-4 py-2 rounded ${selectedCategory === category.category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {category.category}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="cognate-toggle" className="text-sm font-medium">
              Include cognates
            </label>
            <Switch
              checked={includeCognates}
              onCheckedChange={setIncludeCognates}
              id="cognate-toggle"
            />
          </div>
        </div>

        <div className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleArticleClick(article.id)}
            >
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{article.title}</h2>
                  <div className="text-sm text-gray-500 mt-1">
                    {article.percentUnderstood}% understood
                  </div>
                </div>
                <div className="text-sm text-gray-500 text-right flex flex-col">
                  <span>{article.source}</span>
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg overflow-hidden relative">
          <div className="relative p-6 md:p-8 text-white z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Use the Chrome Extension</h2>
            <p className="text-lg mb-4">Integrate your vocabulary into any site you're using</p>
            <button className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200" disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ArticleList;