'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import { Loader2 } from 'lucide-react';
import Wordpanel from '../components/Wordpanel';
import { Switch } from '@/components/ui/switch';
import { useVideoRecommendations } from '../hooks/useVideoRecommendations';
import ConfirmationPopup from '../components/ConfirmationPopup';
import { UserContext } from '@/context/UserContext';

const YouTubeVideoGrid: React.FC = () => {
    const { language } = useContext(UserContext); // Access language from UserContext
    const [selectedCategory, setSelectedCategory] = useState<string>('All Videos');
    // TODO: No language selected here?
    const { videos, categories, isVideosLoading, isCategoriesLoading, error } = useVideoRecommendations(selectedCategory, language?.code || 'es');
    const [selectedVideo, setSelectedVideo] = useState<{ id: string, title: string } | null>(null);
    const [confirmationPopup, setConfirmationPopup] = useState<{ count: number, visible: boolean }>({ count: 0, visible: false });
    const [loadedVideos, setLoadedVideos] = useState<Set<string>>(new Set());
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const videoId = entry.target.getAttribute('data-video-id');
                        if (videoId) {
                            setLoadedVideos((prev) => new Set(prev).add(videoId));
                        }
                    }
                });
            },
            { rootMargin: '200px' }
        );

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        const observer = observerRef.current;
        if (observer) {
            document.querySelectorAll('.video-container').forEach((el) => {
                observer.observe(el);
            });
        }

        return () => {
            if (observer) {
                observer.disconnect();
            }
        };
    }, [videos]);

    const handleVideoClick = (videoId: string, videoTitle: string) => {
        setSelectedVideo({ id: videoId, title: videoTitle });
        console.log(videoId);
    };

    const handleWordpanelClose = React.useCallback((addedWordsCount: number) => {
        setSelectedVideo(null);
        if (addedWordsCount > 0) {
            setConfirmationPopup({ count: addedWordsCount, visible: true });
        }
    }, []);

    const handleCloseConfirmationPopup = () => {
        setConfirmationPopup(prev => ({ ...prev, visible: false }));
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
    };

    // Filter out categories labeled 'Failed' or 'Unknown' (case-insensitive)
    const filteredCategories = categories.filter(
        (category) =>
            !/^(failed|unknown)$/i.test(category.category.trim())
    );

    if (isCategoriesLoading) {
        // Show loading state for categories or an initial loading state
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
            <h1 className="text-2xl font-bold mb-4">Videos</h1>

            <div className='flex justify-between'>
                <div className="flex flex-wrap gap-2 mb-4">
                    {filteredCategories.map((category) => (
                        <button
                            key={category.category}
                            onClick={() => handleCategoryChange(category.category)}
                            className={`px-4 py-2 rounded ${selectedCategory === category.category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            {category.category}
                        </button>
                    ))}
                </div>

                {/* Language selection is now handled by UserContext */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isVideosLoading ? (
                    <div className="flex justify-center items-center col-span-full">
                        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                    </div>
                ) : (
                    videos.map((video) => (
                        <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer flex flex-col h-full">
                            <div className="aspect-w-16 aspect-h-8 h-40 video-container relative" data-video-id={video.id}>
                                {playingVideoId === video.id ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${video.id}`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; cc-load-policy=1; cc-lang-pref=es"
                                        allowFullScreen
                                        className="w-full h-full"
                                    ></iframe>
                                ) : (
                                    <div className="w-full h-full relative" onClick={() => setPlayingVideoId(video.id)}>
                                        <img
                                            src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-white opacity-90" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="px-4 pt-2 pb-0 flex-1 flex flex-col">
                                <div className="text-base font-semibold text-gray-900 line-clamp-2 mb-2" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}} title={video.title}>{video.title}</div>
                            </div>
                            <div className="p-4 group relative pt-2 mt-auto border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-md font-medium">
                                            {video.percentUnderstood}%
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            words known
                                        </div>
                                    </div>
                                    <div className="text-right md:group-hover:opacity-0 ml-auto mr-8 md:mx-0 transition-opacity duration-200">
                                        <div className="text-md font-medium">
                                            {video.newWords}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            new words
                                        </div>
                                    </div>
                                    <button
                                        className="md:absolute md:right-4 md:top-1/2 md:transform md:-translate-y-1/2 px-3 py-1 bg-black text-white rounded-md flex items-center space-x-1 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 hover:bg-gray-800 hover:scale-105"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleVideoClick(video.id, `New words in this video`);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                                        </svg>
                                        <span>Practice</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Side panel for new words */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
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
                <ConfirmationPopup
                    count={confirmationPopup.count}
                    onClose={handleCloseConfirmationPopup}
                />
            )}
        </div>
    );
};

export default YouTubeVideoGrid;