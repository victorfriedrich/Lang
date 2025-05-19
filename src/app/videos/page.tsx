"use client";

import YouTubeVideoGrid from '../components/YouTubeVideoGrid';
import ProtectedRoute from '../components/ProtectedRoute';
import VideoRecommendations from '../components/VideoRecommendations';

export default function VideosPage() {
  return <ProtectedRoute><VideoRecommendations /></ProtectedRoute>;
}