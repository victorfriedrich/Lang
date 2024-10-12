"use client";

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, BarChart2, BookMarked, Film, Menu, X, Globe, LogInIcon } from 'lucide-react';
import { UserContext } from '@/context/UserContext'; // Import UserContext

interface SidebarProps {
  documentName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ documentName }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { user, language } = useContext(UserContext); // Access user and language from context
  const [isDemoVisible, setIsDemoVisible] = useState(false); // State for demo message
  const [isLanguagePopupOpen, setIsLanguagePopupOpen] = useState(false); // State for language popup

  useEffect(() => {
    const storedState = localStorage.getItem('sidebar-collapsed');
    if (storedState) {
      setIsCollapsed(storedState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  useEffect(() => {
    if (user?.is_anonymous) {
      setIsDemoVisible(true);
    }
  }, [user]);

  const navItems = [
    { href: '/videos', name: 'Videos', icon: Film },
    { href: '/vocabulary', name: 'Practice', icon: BookMarked },
    { href: '/progress', name: 'Words Known', icon: BarChart2 },
    { href: '/articles', name: 'Articles', icon: BookOpen },
    { href: '/login', name: 'Login', icon: LogInIcon },
  ];

  const handleJoinRoom = async (roomId: string) => {
    console.log(roomId);
  }

  const toggleSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  }

  const toggleLanguagePopup = () => {
    setIsLanguagePopupOpen(!isLanguagePopupOpen);
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-blue-700 text-white fixed top-0 left-0 right-0 z-50 flex items-center">
        <button
          onClick={toggleSidebar}
          className="pl-3 py-3 rounded-md focus:outline-none"
          aria-label={isMobileOpen ? "Close Menu" : "Open Menu"}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        {isDemoVisible && (
          <div className="flex-1 text-center py-2 rounded-md">
            Demo account | <Link href="/start-learning" className="underline underline-offset-2">Sign up</Link> to save your progress
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:sticky md:top-0 md:translate-x-0 md:flex-shrink-0 
          bg-gray-100 border-r border-gray-200 overflow-y-auto
          ${isCollapsed ? 'md:w-16' : 'md:w-60'}
          w-60 md:block
          ${isMobileOpen ? 'block' : 'hidden'}
          md:pt-0 pt-16
          h-full md:h-screen
        `}
      >
        <div className="p-3 flex flex-col h-full">
          {/* Desktop Toggle Button */}
          <div className="hidden md:flex items-center justify-between mb-4">
            {!isCollapsed && (
              <h2 className="text-xl font-bold text-gray-800">Navigation</h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md hover:bg-gray-200"
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ChevronRight
                size={20}
                className={`transform transition-transform ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}
              />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                onClick={() => {
                  handleJoinRoom(item.href);
                  setIsMobileOpen(false);
                }}
                className={`flex items-center py-2 px-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out ${
                  isCollapsed
                    ? 'md:justify-center'
                    : 'justify-start text-gray-800 hover:bg-gray-200'
                }`}
              >
                <item.icon className="h-5 w-5 text-gray-500" />
                <span className={`ml-2 truncate ${isCollapsed ? 'md:hidden' : ''}`}>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="mt-auto p-3 border-t mt-4border-gray-200 relative">
            <div className="flex items-center justify-between">
              {/* Account Information */}
              <button className="flex-1 flex flex-col items-left truncate">
                <p className="text-sm font-medium text-gray-800">Profile</p>
                <p className="text-xs text-gray-500 truncate">{user?.email ? `${user.email.slice(0, 20)}...` : 'Demo Account'}</p>
              </button>
              {/* Language Selector */}
              <button
                onClick={toggleLanguagePopup}
                className="p-2 rounded-md hover:bg-gray-200 focus:outline-none"
                aria-label="Change Language"
              >
                {language?.flag ? (
                  <img
                    src={`https://flagcdn.com/${language.code}.svg`}
                    width={20}
                    height={20}
                    alt={`${language.flag.toLowerCase()} flag`}
                    className="rounded-sm"
                  />
                ) : (
                  <Globe size={20} />
                )}
              </button>
            </div>
            {isLanguagePopupOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsLanguagePopupOpen(false)}
                ></div>
                <div className="absolute bottom-12 right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2 z-50">
                  {/* Language Options */}
                  <div className="flex flex-col space-y-2">
                    {[
                      { code: 'de', name: 'German' },
                      { code: 'es', name: 'Spanish' },
                      { code: 'fr', name: 'French' }
                    ].map((lang) => (
                      <button key={lang.code} className="flex items-center space-x-2 w-full px-2 py-1 hover:bg-gray-100">
                        <img
                          src={`https://flagcdn.com/${lang.code}.svg`}
                          alt={`${lang.name} flag`}
                          width={20}
                          height={20}
                          className="rounded-sm" // Slightly round the flags
                        />
                        <span>{lang.name}</span>
                      </button>
                    ))}
                    {/* Add more language options as needed */}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
};

export default Sidebar;