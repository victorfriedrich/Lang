import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseclient';

interface SeenVideo {
  video_id: string;
}

export const useSeenVideos = (refreshTrigger: number) => {
  const [seenVideos, setSeenVideos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeenVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_seen_video_ids');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setSeenVideos(data.map((item: SeenVideo) => item.video_id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markVideoAsSeen = useCallback(async (videoId: string) => {
    try {
      const { error } = await supabase.rpc('mark_video_as_seen', { input_video_id: videoId });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Refresh the list of seen videos
      fetchSeenVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [fetchSeenVideos]);

  useEffect(() => {
    fetchSeenVideos();
  }, [fetchSeenVideos, refreshTrigger]);

  return { seenVideos, isLoading, error, markVideoAsSeen };
};