import type { Metadata } from "next";
import React from 'react';
import localFont from "next/font/local";
import "./globals.css";
import { UserProvider } from '@/context/UserContext';
import DemoAccountHeader from '@/app/components/DemoAccountHeader';
import Sidebar from '@/app/components/Sidebar'; // Import the client Sidebar
import { TutorialProvider } from "@/context/TutorialContext";
import { Analytics } from "@vercel/analytics/react"

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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-100 flex flex-col md:flex-row`}>
        <UserProvider>
          <TutorialProvider>
            <Sidebar
              documentName={undefined} // Pass necessary props if any
            />

            <main className="flex-1 md:pt-0 pt-12"> {/* Add padding top for mobile */}
              <DemoAccountHeader />
              {children}
            </main>
          </TutorialProvider>
        </UserProvider>
      </body>
    </html>
  );
}