'use client';
import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import Wordpanel from '../components/Wordpanel';
import { Switch } from '@/components/ui/switch';
import { useVideoRecommendations } from '../hooks/useVideoRecommendations';
import ProtectedRoute from '../components/ProtectedRoute';

const YouTubeVideoGrid: React.FC = () => {
  const [includeCognates, setIncludeCognates] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Videos');
  const { videos, categories, isLoading, error } = useVideoRecommendations(includeCognates, selectedCategory);
  const [selectedVideo, setSelectedVideo] = useState<{ id: string, title: string } | null>(null);
  const [confirmationPopup, setConfirmationPopup] = useState<{ count: number, visible: boolean }>({ count: 0, visible: false });

  const handleVideoClick = (videoId: string, videoTitle: string) => {
    setSelectedVideo({ id: videoId, title: videoTitle });
    console.log(videoId);
  };

  const handleWordpanelClose = React.useCallback((addedWordsCount: number) => {
    setSelectedVideo(null);
    if (addedWordsCount > 0) {
      setConfirmationPopup({ count: addedWordsCount, visible: true });
      setTimeout(() => setConfirmationPopup(prev => ({ ...prev, visible: false })), 3000);
    }
  }, []);

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
    <ProtectedRoute>
      <div className="container mx-auto p-4 relative">
        <h1 className="text-2xl font-bold mb-4">Spanish Videos</h1>

        {/* Add cognate toggle and category selection */}


        <div className='flex justify-between'>
          <div className="flex space-x-2 mb-4">
            {categories.map((category) => (
              <button
                key={category.category}
                onClick={() => setSelectedCategory(category.category)}
                className={`px-4 py-2 rounded ${selectedCategory === category.category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {category.category}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <label htmlFor="cognate-toggle" className="text-sm font-medium">
              Include cognates
            </label>
            <Switch
              checked={includeCognates}
              onCheckedChange={setIncludeCognates}
              id="cognate-toggle"
            />

          </div>
        </div>

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
                onClick={() => handleVideoClick(video.id, `New words in this video`)}
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
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedVideo(null)}
          >
            <Wordpanel
              videoId={selectedVideo.id}
              videoTitle={selectedVideo.title}
              onClose={handleWordpanelClose}
            />
          </div>
        )}

        {confirmationPopup.visible && (
          <div className="fixed top-4 right-4 bg-white text-slate-700 px-4 py-3 rounded shadow-lg z-50 transition-opacity duration-300">
            {confirmationPopup.count} {confirmationPopup.count === 1 ? 'word' : 'words'} added to learning set
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default YouTubeVideoGrid;