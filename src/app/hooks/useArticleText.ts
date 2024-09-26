import { useState, useEffect } from 'react';

interface ArticleWord {
  content: string;
  id?: number;
}

interface ArticleData {
  title: string;
  content: ArticleWord[];
}

export const useArticleText = (articleId: string) => {
  const [articleTitle, setArticleTitle] = useState<string>('');
  const [articleText, setArticleText] = useState<ArticleWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticleText = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/article/${articleId}`);
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
