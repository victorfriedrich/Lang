'use client';
import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Wordpanel from '../components/Wordpanel';

interface Video {
  id: string;
  percentUnderstood: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const YouTubeVideoGrid: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ id: string, title: string } | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/recommendations/');
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        const data = await response.json();
        const videosWithPercentages = data.video_ids.map((id: string, index: number) => ({
          id,
          percentUnderstood: Math.round(data.ratio[index] * 100)
        }));
        setVideos(videosWithPercentages);
      } catch (err) {
        setError('Failed to load 2 recommendations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoClick = (videoId: string, videoTitle: string) => {
    setSelectedVideo({ id: videoId, title: videoTitle });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 relative">
      <h1 className="text-2xl font-bold mb-4">YouTube Videos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div 
              className="p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              onClick={() => handleVideoClick(video.id, `New Words`)}
            >
              <div className="text-sm text-blue-600 font-medium">
                {video.percentUnderstood}% understood
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Click to see new words
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Side panel for new words */}
      {selectedVideo && (
        <Wordpanel 
          videoId={selectedVideo.id} 
          videoTitle={selectedVideo.title} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </div>
  );
};

export default YouTubeVideoGrid;