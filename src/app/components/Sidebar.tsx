"use client";

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, BarChart2, BookMarked, Film, Menu, X } from 'lucide-react';
import { UserContext } from '@/context/UserContext'; // Import UserContext

interface SidebarProps {
  documentName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ documentName }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { user } = useContext(UserContext); // Access user context
  const [isDemoVisible, setIsDemoVisible] = useState(false); // State for demo message

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
    { href: '/vocabulary', name: 'Vocabulary', icon: BookMarked },
    { href: '/progress', name: 'Learning Progress', icon: BarChart2 },
    { href: '/articles', name: 'Articles', icon: BookOpen },
    { href: '/videos', name: 'Videos', icon: Film },
  ];

  const handleJoinRoom = async (roomId: string) => {
    console.log(roomId);
  }

  const toggleSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-blue-700 text-white fixed top-0 left-0 right-0 z-50 flex items-center">
        <button
          onClick={toggleSidebar}
          className="px-3 py-3 rounded-md focus:outline-none"
          aria-label={isMobileOpen ? "Close Menu" : "Open Menu"}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        {isDemoVisible && (
          <div className="flex-1 text-center py-2 ml-2 rounded-md">
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
          md:relative md:translate-x-0 md:flex-shrink-0 
          bg-gray-100 border-r border-gray-200 overflow-y-auto
          ${isCollapsed ? 'md:w-16' : 'md:w-60'}
          w-60 md:block
          ${isMobileOpen ? 'block' : 'hidden'}
          md:pt-0 pt-16
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