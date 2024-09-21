'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const ArticleList: React.FC = () => {
  const [articles, setArticles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/articles`);
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data = await response.json();
        setArticles(data.article_ids);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching articles.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

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

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Available Articles</h1>
      <ul className="space-y-2">
        {articles.map((articleId) => (
          <li key={articleId} className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
            <Link href={`/read/${articleId}`} className="text-blue-500 hover:underline">
              {articleId}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArticleList;