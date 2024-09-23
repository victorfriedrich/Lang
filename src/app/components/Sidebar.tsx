import React, { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import CourseList from './CourseList';

interface SidebarProps {
    chatRooms: any[];
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    documentName: string | undefined;
    handleJoinRoom: (roomId: string) => void;
}

export default function Sidebar({ chatRooms, sidebarOpen, setSidebarOpen, documentName, handleJoinRoom }: SidebarProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredChatRooms = chatRooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`bg-gray-100 border-r border-gray-200 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
            <div className="p-3">
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-bold text-gray-800 ${!sidebarOpen && 'hidden'}`}>Courses</h2>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
                        <ChevronRight className={`h-5 w-5 ml-2 transform transition-transform ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
                    </button>
                </div>
                {sidebarOpen && (
                    <div className="mb-4 relative">
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-0 focus:ring-blue-500"
                        />
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                )}
                
                <CourseList
                    chatRooms={filteredChatRooms}
                    sidebarOpen={sidebarOpen}
                    documentName={documentName}
                    handleJoinRoom={handleJoinRoom}
                />
            </div>
        </div>
    );
}