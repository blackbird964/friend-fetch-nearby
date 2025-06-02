
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Info } from 'lucide-react';
import UserList from '@/components/users/UserList';
import TodayActivitiesSection from '@/components/home/TodayActivitiesSection';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { currentUser, nearbyUsers, chats, friendRequests } = useAppContext();
  const navigate = useNavigate();
  
  // Count accepted friends
  const acceptedFriends = friendRequests.filter(req => req.status === 'accepted').length;
  const totalFriends = chats.length;
  const friendsCount = Math.max(acceptedFriends, totalFriends);
  
  return (
    <div className="container mx-auto px-4 py-6 mb-20 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {currentUser?.name?.split(' ')[0]}</h1>
      </div>
      
      <div className="space-y-6">
        {/* App Info */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">How Kairo Works:</p>
                <p className="text-gray-600">
                  Find people nearby who share your interests, send them friend requests, 
                  and once connected, you can chat and plan meet-ups with specific time blocks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Activities Section */}
        <TodayActivitiesSection />
        
        {/* Nearby Users */}
        <UserList />
      </div>
    </div>
  );
};

export default Home;
