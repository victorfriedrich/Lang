import { ChevronRight } from 'lucide-react';

interface CourseListProps {
    chatRooms: any[];
    sidebarOpen: boolean;
    documentName: string | undefined;
    handleJoinRoom: (roomId: string) => void;
}

export default function CourseList({ chatRooms, sidebarOpen, documentName, handleJoinRoom }: CourseListProps) {
    const bookSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJvb2siPjxwYXRoIGQ9Ik00IDE5LjV2LTE1QTIuNSAyLjUgMCAwIDEgNi41IDJIMjB2MjBINi41YTIuNSAyLjUgMCAwIDEgMC01SDIwIi8+PC9zdmc+"

    return (
        <div className="space-y-1">
            {chatRooms.map((room) => (
                <div key={room.id} className="relative group">
                    <button
                        onClick={() => handleJoinRoom(room.id)}
                        className={`w-full py-2 px-2 text-sm text-left font-medium relative z-10 transition duration-150 ease-in-out flex items-center rounded-md ${
                            documentName === room.name.toLowerCase()
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-800 hover:bg-gray-200'
                        }`}
                    >
                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                            <img 
                                src={room.icon_link ?? bookSVG} 
                                className="max-w-full max-h-full object-contain" 
                                alt={room.name} 
                            />
                        </div>
                        {sidebarOpen && (
                            <span className="ml-2 truncate">{room.name}</span>
                        )}
                        {sidebarOpen && (
                            <ChevronRight className="h-5 w-5 ml-auto text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                    </button>
                </div>
            ))}
        </div>
    );
}