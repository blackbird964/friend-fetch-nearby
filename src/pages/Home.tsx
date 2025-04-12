
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MapPin, MessageSquare, Info } from 'lucide-react';
import FriendRequestList from '@/components/users/FriendRequestList';
import UserList from '@/components/users/UserList';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { friendRequests, nearbyUsers, currentUser } = useAppContext();
  const navigate = useNavigate();
  
  const pendingRequests = friendRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-6 mb-20 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {currentUser?.name?.split(' ')[0]}</h1>
      </div>
      
      <div className="space-y-6">
        {/* Friend Requests */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center">
                <Bell className="mr-2 h-5 w-5 text-primary" />
                Friend Requests
              </CardTitle>
              {pendingRequests > 0 && (
                <span className="bg-primary text-white text-sm font-medium py-1 px-2 rounded-full">
                  {pendingRequests} new
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <FriendRequestList />
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="h-auto py-6 flex flex-col items-center justify-center space-y-2"
            onClick={() => navigate('/map')}
          >
            <MapPin className="h-6 w-6" />
            <span>Find Friends</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center justify-center space-y-2"
            onClick={() => navigate('/chat')}
          >
            <MessageSquare className="h-6 w-6" />
            <span>Messages</span>
          </Button>
        </div>
        
        {/* App Info */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">How PairUp Works:</p>
                <p className="text-gray-600">
                  Find people nearby who share your interests, select a time block (15, 30, or 45 minutes), 
                  and send them a meet-up request. If accepted, you can chat and see each other's location.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Nearby Users */}
        <UserList />
      </div>
    </div>
  );
};

export default Home;
