"use client";
import ProtectedRoute from "../components/ProtectedRoute";
import ExtensionGuide from "../components/ExtensionGuide";
import ReaderModeDemo from "../components/ReaderModeDemo";

export default function ArticlesPage() {
    return <ProtectedRoute><ReaderModeDemo /></ProtectedRoute>;
  }
  