import { useState, useEffect, useContext } from 'react';
import { UserContext } from '@/context/UserContext';

interface WordRecommendations {
    word_ids: number[];
    improvements: number[];
    frequencies: number[];
}

export const useWordRecommendations = (category: string | null) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const [recommendations, setRecommendations] = useState<WordRecommendations | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { fetchWithAuth, language } = useContext(UserContext);

    const fetchRecommendations = async () => {
        if (!category) return;

        setIsLoading(true);
        try {
            const categoryParam = category ? `&category=${encodeURIComponent(category)}` : '';
            const response = await fetchWithAuth(
                `${API_URL}/recommendations/words/?language=${language?.code}${categoryParam}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch word recommendations');
            }

            const data = await response.json();
            setRecommendations({
                word_ids: data.word_ids,
                improvements: data.improvements,
                frequencies: data.frequencies
            });
        } catch (err) {
            console.error(err);
            setError('Failed to load word recommendations. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, fetchWithAuth, language, API_URL]);

    const refreshRecommendations = () => {
        fetchRecommendations();
    };

    return { recommendations, isLoading, error, refreshRecommendations };
};
