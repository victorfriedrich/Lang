import type { Metadata } from "next";
import React from 'react';
import localFont from "next/font/local";
import "./globals.css";
import { UserProvider } from '@/context/UserContext';
import DemoAccountHeader from '@/app/components/DemoAccountHeader';
import Sidebar from '@/app/components/Sidebar'; // Import the client Sidebar

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-100 flex`}>
        <UserProvider>
          <Sidebar
            documentName={undefined} // Pass necessary props if any
          />

          <main className="flex-1">
            <DemoAccountHeader />
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  );
}