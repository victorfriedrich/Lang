"use client";

import YouTubeVideoGrid from '../components/YouTubeVideoGrid';
import ProtectedRoute from '../components/ProtectedRoute';

export default function VideosPage() {
  return <ProtectedRoute><YouTubeVideoGrid /></ProtectedRoute>;
}