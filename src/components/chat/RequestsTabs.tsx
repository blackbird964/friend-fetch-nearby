
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
      className="w-full h-full flex flex-col"
    >
      <TabsList className="grid w-full grid-cols-2 mb-3">
        <TabsTrigger value="friends" className="relative text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Friend</span>
            <span className="sm:hidden">Friends</span>
          </div>
          {pendingFriendRequests > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
              {pendingFriendRequests}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="meetups" className="relative text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Meetups</span>
            <span className="sm:hidden">Meetups</span>
          </div>
          {pendingMeetupRequests > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
              {pendingMeetupRequests}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-y-auto">
        <TabsContent value="friends" className="mt-0 h-full">
          <Card className="h-full">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Friend Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <FriendRequestList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetups" className="mt-0 h-full">
          <Card className="h-full">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Meetup Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <MeetupRequestsList />
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default RequestsTabs;
