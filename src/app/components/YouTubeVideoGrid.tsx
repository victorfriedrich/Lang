import React, { useState, useEffect } from 'react';
import { Loader2, X, Bookmark } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface Video {
  id: string;
  percentUnderstood: number;
}

interface Word {
  id: number;
  root: string;
  isBookmarked: boolean;
}

// Supabase response type
interface WordData {
  id: number;
  root: string;
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
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [newWords, setNewWords] = useState<Word[]>([]);
  const [isWordListLoading, setIsWordListLoading] = useState(false);

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
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const fetchNewWords = async (videoId: string) => {
    setIsWordListLoading(true);
    try {
      // First, get the IDs of CREA words
      const { data: creaData, error: creaError } = await supabase
        .from('words')
        .select('id')
        .eq('source', 'CREA')
        .limit(300);

      if (creaError) throw creaError;

      const creaIds = creaData.map((item: { id: number }) => item.id);

      // Then, fetch words for the video that are not in CREA
      const { data, error } = await supabase
        .from('words')
        .select('id, root')
        .not('id', 'in', `(${creaIds.join(',')})`)
        .order('root', { ascending: true });

      if (error) throw error;

      const words: Word[] = (data as WordData[]).map((word: WordData) => ({
        id: word.id,
        root: word.root,
        isBookmarked: false
      }));

      setNewWords(words);
    } catch (err) {
      console.error('Error fetching new words:', err);
      setError('Failed to load new words. Please try again.');
    } finally {
      setIsWordListLoading(false);
    }
  };

  const handleVideoClick = (videoId: string) => {
    setSelectedVideo(videoId);
    fetchNewWords(videoId);
  };

  const toggleBookmark = (wordId: number) => {
    setNewWords(words =>
      words.map(word =>
        word.id === wordId ? { ...word, isBookmarked: !word.isBookmarked } : word
      )
    );
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
              onClick={() => handleVideoClick(video.id)}
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
      <div 
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          selectedVideo ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">New Words</h2>
            <button onClick={() => setSelectedVideo(null)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isWordListLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
            </div>
          ) : (
            <ul className="space-y-2">
              {newWords.map((word) => (
                <li key={word.id} className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">{word.root}</span>
                  <button 
                    onClick={() => toggleBookmark(word.id)}
                    className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
                  >
                    <Bookmark size={20} fill={word.isBookmarked ? "currentColor" : "none"} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeVideoGrid;