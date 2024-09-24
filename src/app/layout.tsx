import type { Metadata } from "next";
import React from 'react';
import localFont from "next/font/local";
import Link from 'next/link';
import "./globals.css";
import { ChevronRight, Home, BookOpen, Link as LinkIcon, BarChart2, Trophy, BookMarked } from 'lucide-react';
import { UserProvider } from '@/context/UserContext';
import DemoAccountHeader from '@/app/components/DemoAccountHeader';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Your App Name",
  description: "Your app description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { href: '/', name: 'Home', icon: Home },
    { href: '/articles', name: 'Articles', icon: BookOpen },
    { href: '/parse', name: 'Parse URL', icon: LinkIcon },
    { href: '/proficiency', name: 'Proficiency', icon: BarChart2 },
    { href: '/ranking', name: 'Ranking', icon: Trophy },
    { href: '/vocabulary', name: 'Vocabulary', icon: BookMarked },
  ];

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-100 flex`}>
        <UserProvider>
          <div className="bg-gray-100 border-r border-gray-200 overflow-y-auto transition-all duration-300 nav-collapsed">
            <div className="p-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 nav-title">Navigation</h2>
                <button className="p-1 rounded-md hover:bg-gray-200 nav-toggle">
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="space-y-1">
                {navItems.map((item) => (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      className="w-full py-2 px-2 text-sm text-left font-medium relative z-10 transition duration-150 ease-in-out flex items-center rounded-md text-gray-800 hover:bg-gray-200 nav-link"
                    >
                      <item.icon className="h-5 w-5 text-gray-500" />
                      <span className="ml-2 truncate nav-text">{item.name}</span>
                      <ChevronRight className="h-5 w-5 ml-auto text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 nav-chevron" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <main className="flex-1">
            <DemoAccountHeader />
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  );
}