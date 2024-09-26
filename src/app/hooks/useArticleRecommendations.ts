import { useState, useEffect, useContext } from 'react';
import { UserContext } from '@/context/UserContext';

interface Article {
  id: string;
  percentUnderstood: number;
  title: string;
  source: string;
  date: string;
}

interface Category {
  category: string;
  icon: string;
}

export const useArticleRecommendations = (includeCognates: boolean, selectedCategory: string) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth } = useContext(UserContext);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchWithAuth('http://127.0.0.1:8000/categories/articles');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories([{ category: 'All Articles', icon: '' }, ...data.categories]);
      } catch (err) {
        console.error(err);
        setError('Failed to load categories. Please try again later.');
      }
    };

    fetchCategories();
  }, [fetchWithAuth]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const categoryParam = selectedCategory === 'All Articles' ? '' : `&category=${selectedCategory}`;
        const response = await fetchWithAuth(`http://127.0.0.1:8000/recommendations/articles/?include_cognates=${includeCognates}${categoryParam}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        const data = await response.json();
        const articlesWithDetails = data.articles.map((article: any) => ({
          id: article.id,
          percentUnderstood: article.percentUnderstood, // Use percentUnderstood directly from the response
          title: article.title,
          source: article.source,
          date: article.date,
        }));
        setArticles(articlesWithDetails);
      } catch (err) {
        console.error(err);
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [includeCognates, selectedCategory, fetchWithAuth]);

  return { articles, categories, isLoading, error };
};