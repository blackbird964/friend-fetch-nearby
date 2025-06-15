
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, MoreHorizontal, Check, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUpcomingSessions } from '@/hooks/useUpcomingSessions';
import UserAvatar from '@/components/users/cards/UserAvatar';

const UpcomingSessionsSection: React.FC = () => {
  const { upcomingSessions, isLoading, handleCompleteSession, handleCancelSession } = useUpcomingSessions();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Catch-ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingSessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Catch-ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No upcoming catch-ups scheduled</p>
            <p className="text-sm">Accept meetup requests to see them here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Catch-ups ({upcomingSessions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingSessions.map(session => (
            <div key={session.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserAvatar
                    src={session.friend_profile_pic}
                    alt={session.friend_name}
                    size="md"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{session.friend_name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{session.activity}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{session.duration} minutes</span>
                    </div>
                  </div>
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="end">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleCompleteSession(session.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleCancelSession(session.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Meetup
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingSessionsSection;
