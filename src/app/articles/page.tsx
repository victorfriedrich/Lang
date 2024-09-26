"use client";

import ArticleList from '../components/ArticleList';
import ProtectedRoute from '../components/ProtectedRoute';
export default function ArticlesPage() {
  return <ProtectedRoute><ArticleList /></ProtectedRoute>;
}
