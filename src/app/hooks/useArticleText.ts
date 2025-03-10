import { UserContext } from '@/context/UserContext';
import { useState, useEffect, useContext } from 'react';

interface ArticleWord {
  content: string;
  id?: number;
}

interface ArticleData {
  title: string;
  content: ArticleWord[];
}

export const useArticleText = (articleId: string) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [articleTitle, setArticleTitle] = useState<string>('');
  const [articleText, setArticleText] = useState<ArticleWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useContext(UserContext)

  useEffect(() => {
    const fetchArticleText = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/article/${articleId}?language=${language?.code}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        if (!responseData.article) {
          throw new Error('Article data not found in response');
        }
        const articleData: ArticleData = responseData.article;
        setArticleTitle(articleData.title);
        setArticleText(articleData.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching the article');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticleText();
  }, [articleId]);

  return { articleTitle, articleText, isLoading, error };
};
