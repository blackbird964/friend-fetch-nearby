
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, MessageSquare, User, Home } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Badge } from "@/components/ui/badge";

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    friendRequests, 
    currentUser, 
    refreshFriendRequests,
    unreadMessageCount 
  } = useAppContext();
  
  // Refresh friend requests when component mounts
  useEffect(() => {
    if (currentUser) {
      refreshFriendRequests();
    }
  }, [currentUser, refreshFriendRequests]);
  
  const pendingRequests = friendRequests.filter(r => 
    r.status === 'pending' && r.receiverId === currentUser?.id
  ).length;
  
  // Total notifications for the chat tab
  const totalNotifications = pendingRequests + unreadMessageCount;
  
  const routes = [
    {
      path: '/home',
      label: 'Home',
      icon: <Home className="h-6 w-6" />,
    },
    {
      path: '/map',
      label: 'Find',
      icon: <MapPin className="h-6 w-6" />,
    },
    {
      path: '/chat',
      label: 'Chats',
      icon: <MessageSquare className="h-6 w-6" />,
      badge: totalNotifications,
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: <User className="h-6 w-6" />,
    },
  ];

  // Navigation handler with event capture
  const handleNavigate = (path: string, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log(`[BottomNavigation] Navigating from ${location.pathname} to ${path}`);
    navigate(path);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-[9999]"
      style={{ 
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
    >
      <div className="flex justify-around items-center h-16 bg-white">
        {routes.map((route) => (
          <button
            key={route.path}
            type="button"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors cursor-pointer select-none border-0 bg-transparent p-2 ${
              location.pathname === route.path
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={(e) => handleNavigate(route.path, e)}
            onTouchEnd={(e) => handleNavigate(route.path, e)}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              pointerEvents: 'auto',
              zIndex: 10000
            }}
          >
            <div className="relative">
              {route.icon}
              {route.badge && route.badge > 0 && (
                <Badge className="absolute -top-2 -right-2 px-1 min-h-5 min-w-5 h-5 w-5 flex items-center justify-center text-[10px] bg-red-500 text-white rounded-full">
                  {route.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs mt-1">{route.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
