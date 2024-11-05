"use client";
import ProtectedRoute from "../components/ProtectedRoute";
import ExtensionGuide from "../components/ExtensionGuide";

export default function ArticlesPage() {
    return <ProtectedRoute><ExtensionGuide /></ProtectedRoute>;
  }
  