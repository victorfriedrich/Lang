import { useState, useEffect, useContext } from 'react';
import { UserContext } from '@/context/UserContext';

interface Video {
  id: string;
  percentUnderstood: number;
}

interface Category {
  category: string;
  icon: string;
}

export const useVideoRecommendations = (includeCognates: boolean, selectedCategory: string) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth } = useContext(UserContext);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetchWithAuth(`${API_URL}/categories`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories([{ category: 'All Videos', icon: '' }, ...data.categories]);
      } catch (err) {
        console.error(err);
        setError('Failed to load categories. Please try again later.');
      }
    };

    fetchCategories();
  }, [fetchWithAuth]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const categoryParam = selectedCategory === 'All Videos' ? '' : `&category=${selectedCategory}`;

        const response = await fetchWithAuth(`${API_URL}/recommendations/videos/?include_cognates=${includeCognates}${categoryParam}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        const data = await response.json();
        const videosWithPercentages = data.ids.map((id: string, index: number) => ({
          id,
          percentUnderstood: Math.round(data.ratios[index] * 100)
        }));
        setVideos(videosWithPercentages);
      } catch (err) {
        console.error(err);
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [includeCognates, selectedCategory, fetchWithAuth]);

  return { videos, categories, isLoading, error };
};
