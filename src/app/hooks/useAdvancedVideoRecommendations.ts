import { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '@/context/UserContext';

interface Video {
  id: string;
  title: string;
  percentUnderstood: number;
  usefulWords: number;
  newWords: number;
}

interface Category {
  category: string;
  icon: string;
}

export const useVideoRecommendations = (selectedCategory: string, language: string) => {
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
      const languageParam = `&language=${encodeURIComponent(language)}`;
      const res = await fetchWithAuth(`${API_URL}/categories/videos?${languageParam}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories([{ category: 'All Videos', icon: '' }, ...data.categories]);
    } catch (err) {
      console.error(err);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setIsCategoriesLoading(false);
    }
  }, [fetchWithAuth, language]);

  const fetchVideos = useCallback(async () => {
    setIsVideosLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const tradeoff = 1.0;
      const videoCatParam =
        selectedCategory === 'All Videos'
          ? ''
          : `&video_category=${encodeURIComponent(selectedCategory)}`;
      const wordCategory = ''; // tweak in code as needed

      const url = `${API_URL}/recommendations/videos/custom?tradeoff=${tradeoff}${videoCatParam}&language=${encodeURIComponent(
        language
      )}`;
      console.log('Fetching recommendations from:', url);
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error(`API responded ${res.status}`);
      const data = await res.json();
      console.log('Raw recommendations payload:', data);

      // Guard against malformed payload
      if (
        !data.ids ||
        !Array.isArray(data.ids) ||
        !data.titles ||
        !Array.isArray(data.titles) ||
        data.ids.length !== data.titles.length ||
        !data.ratios ||
        !Array.isArray(data.ratios) ||
        data.ratios.length !== data.ids.length ||
        !data.newWords ||
        !Array.isArray(data.newWords)
      ) {
        console.error('Unexpected recs format:', data);
        throw new Error('Invalid recommendations data');
      }

      const videosWithPercentages = data.ids.map((id: string, idx: number) => ({
        id,
        title: data.titles[idx],
        percentUnderstood: Math.round(data.ratios[idx] * 100),
        usefulWords: data.usefulWords[idx],
        newWords: data.newWords[idx]
      }));

      setVideos(videosWithPercentages);
    } catch (err) {
      console.error(err);
      setError(
        typeof err === 'string'
          ? err
          : err instanceof Error
          ? err.message
          : 'Failed to load recommendations'
      );
    } finally {
      setIsVideosLoading(false);
    }
  }, [selectedCategory, language, fetchWithAuth]);

  useEffect(() => {
    fetchCategories();
    fetchVideos();
  }, [fetchCategories, fetchVideos]);

  return { videos, categories, isVideosLoading, isCategoriesLoading, error };
};
