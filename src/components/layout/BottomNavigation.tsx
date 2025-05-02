
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, MessageSquare, User, Home } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Badge } from "@/components/ui/badge";

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { friendRequests, chats, currentUser, refreshFriendRequests } = useAppContext();
  
  // Refresh friend requests when component mounts
  useEffect(() => {
    if (currentUser) {
      refreshFriendRequests();
    }
  }, [currentUser]);
  
  const pendingRequests = friendRequests.filter(r => 
    r.status === 'pending' && r.receiverId === currentUser?.id
  ).length;
  
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
      badge: pendingRequests,
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: <User className="h-6 w-6" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
      <div className="flex justify-around items-center h-16">
        {routes.map((route) => (
          <button
            key={route.path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              location.pathname === route.path
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => navigate(route.path)}
          >
            <div className="relative">
              {route.icon}
              {route.badge > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1 h-4 min-w-4 flex items-center justify-center text-[10px]">
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
