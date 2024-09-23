import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from 'next/link';
import "./globals.css";
import { ChevronRight } from 'lucide-react';

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
    { href: '/', name: 'Home' },
    { href: '/articles', name: 'Articles' },
    { href: '/parse', name: 'Parse URL' },
    { href: '/proficiency', name: 'Proficiency' },
    { href: '/ranking', name: 'Ranking' },
    { href: '/vocabulary', name: 'Vocabulary' },
    { href: '/session', name: 'Session' },
  ];

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-100 flex`}>
        <div className="bg-gray-100 border-r border-gray-200 overflow-y-auto w-64">
          <div className="p-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Navigation</h2>
            </div>
            
            <div className="space-y-1">
              {navItems.map((item) => (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className="w-full py-2 px-2 text-sm text-left font-medium relative z-10 transition duration-150 ease-in-out flex items-center rounded-md text-gray-800 hover:bg-gray-200"
                  >
                    <span className="ml-2 truncate">{item.name}</span>
                    <ChevronRight className="h-5 w-5 ml-auto text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
