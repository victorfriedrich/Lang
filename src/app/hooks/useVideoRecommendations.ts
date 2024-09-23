import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories([{ category: 'All Videos', icon: '' }, ...data.categories]);
      } catch (err) {
        console.log(err);
        setError('Failed to load categories. Please try again later.');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const categoryParam = selectedCategory === 'All Videos' ? '' : `&category=${selectedCategory}`;
        const response = await fetch(`http://127.0.0.1:8000/recommendations/?include_cognates=${includeCognates}${categoryParam}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        const data = await response.json();
        console.log(data);
        const videosWithPercentages = data.video_ids.map((id: string, index: number) => ({
          id,
          percentUnderstood: Math.round(data.ratios[index] * 100)
        }));
        setVideos(videosWithPercentages);
      } catch (err) {
        console.log(err);
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [includeCognates, selectedCategory]);

  return { videos, categories, isLoading, error };
};
