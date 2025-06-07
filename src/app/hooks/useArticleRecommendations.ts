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

export const useArticleRecommendations = (selectedCategory: string) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth, language } = useContext(UserContext);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetchWithAuth(`${API_URL}/categories/articles`);
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
        const categoryParam = selectedCategory === 'All Articles' ? '' : `&category=${encodeURIComponent(selectedCategory)}`;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetchWithAuth(`${API_URL}/recommendations/articles/?language=${language?.code}${categoryParam}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        
        const data = await response.json();
        console.log(data); // Log the response to verify structure
    
        // Create articles from the available data
        const articlesWithDetails = data.titles.map((title: string, index: number) => ({
          id: data.ids[index], // Assuming ids and titles are in the same order
          percentUnderstood: data.ratios[index] || 0, // Provide a default value if undefined
          title: title,
          source: '', // Adjust as necessary if source information is available
          date: new Date().toISOString(), // Or set a default date if applicable
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
  }, [selectedCategory, fetchWithAuth]);
  

  return { articles, categories, isLoading, error };
};