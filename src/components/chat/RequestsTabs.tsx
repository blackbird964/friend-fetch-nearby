
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
    <div className="h-full flex flex-col bg-white">
      <Tabs
        defaultValue="friends"
        value={activeRequestsTab}
        onValueChange={setActiveRequestsTab}
        className="h-full flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 mx-3 mt-3 mb-2 bg-gray-100">
          <TabsTrigger value="friends" className="relative text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Friends</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="meetups" className="relative text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Meetups</span>
            </div>
            {pendingMeetupRequests > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {pendingMeetupRequests}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <TabsContent value="friends" className="mt-0 h-full">
            <Card className="h-full border-0 shadow-none">
              <CardHeader className="pb-3 px-0">
                <CardTitle className="text-lg flex items-center text-gray-900">
                  <UserPlus className="mr-2 h-5 w-5 text-blue-600" />
                  Friend Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <FriendRequestList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetups" className="mt-0 h-full">
            <Card className="h-full border-0 shadow-none">
              <CardHeader className="pb-3 px-0">
                <CardTitle className="text-lg flex items-center text-gray-900">
                  <Calendar className="mr-2 h-5 w-5 text-green-600" />
                  Meetup Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <MeetupRequestsList />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default RequestsTabs;
