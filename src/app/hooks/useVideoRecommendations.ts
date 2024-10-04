import { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '@/context/UserContext';

interface Video {
  id: string;
  percentUnderstood: number;
  newWords: number;
}

interface Category {
  category: string;
  icon: string;
}

export const useVideoRecommendations = (selectedCategory: string) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isVideosLoading, setIsVideosLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth } = useContext(UserContext);

  const fetchCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
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
    } finally {
      setIsCategoriesLoading(false);
    }
  }, [fetchWithAuth]);

  const fetchVideos = useCallback(async () => {
    setIsVideosLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const categoryParam = selectedCategory === 'All Videos' ? '' : `&category=${encodeURIComponent(selectedCategory)}`;

      const response = await fetchWithAuth(`${API_URL}/recommendations/videos/?${categoryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      console.log(data);
      const videosWithPercentages = data.ids.map((id: string, index: number) => ({
        id,
        percentUnderstood: Math.round(data.ratios[index] * 100),
        newWords: data.newWords[index]
      }));
      setVideos(videosWithPercentages);
    } catch (err) {
      console.error(err);
      setError('Failed to load recommendations. Please try again later.');
    } finally {
      setIsVideosLoading(false);
    }
  }, [selectedCategory, fetchWithAuth]);

  useEffect(() => {
    // Fetch both categories and videos in parallel
    fetchCategories();
    fetchVideos();
  }, [fetchCategories, fetchVideos]);

  return { videos, categories, isVideosLoading, isCategoriesLoading, error };
};