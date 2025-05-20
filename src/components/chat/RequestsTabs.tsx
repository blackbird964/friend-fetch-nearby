
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Calendar } from 'lucide-react';
import FriendRequestList from '@/components/users/FriendRequestList';
import MeetupRequestsList from '@/components/users/meet-requests/MeetupRequestsList';

interface RequestsTabsProps {
  activeRequestsTab: string;
  setActiveRequestsTab: React.Dispatch<React.SetStateAction<string>>;
  pendingFriendRequests: number;
  pendingMeetupRequests: number;
}

const RequestsTabs: React.FC<RequestsTabsProps> = ({
  activeRequestsTab,
  setActiveRequestsTab,
  pendingFriendRequests,
  pendingMeetupRequests
}) => {
  return (
    <Tabs
      defaultValue="friends"
      value={activeRequestsTab}
      onValueChange={setActiveRequestsTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="friends" className="relative">
          <div className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            <span>Friend</span>
          </div>
          {pendingFriendRequests > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingFriendRequests}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="meetups" className="relative">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Meetups</span>
          </div>
          {pendingMeetupRequests > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingMeetupRequests}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="friends">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <UserPlus className="mr-2 h-5 w-5 text-primary" />
              Friend Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FriendRequestList />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="meetups">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Meetup Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MeetupRequestsList />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default RequestsTabs;
