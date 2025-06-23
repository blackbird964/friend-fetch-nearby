
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, Activity } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface EmptyUserListProps {
  hasLocation: boolean;
}

const EmptyUserList: React.FC<EmptyUserListProps> = ({ hasLocation }) => {
  const { currentUser } = useAppContext();
  
  // Check if user has selected activities
  const hasSelectedActivities = currentUser?.todayActivities && currentUser.todayActivities.length > 0;

  if (!hasLocation) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Location needed</h3>
          <p className="text-gray-600">
            Please enable location sharing to find people nearby.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!hasSelectedActivities) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select activities to get started</h3>
          <p className="text-gray-600">
            Choose what you want to do today above to find people with similar interests nearby.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
        <p className="text-gray-600 mb-2">
          No one nearby is interested in the same activities as you right now.
        </p>
        <p className="text-sm text-gray-500">
          Try selecting different activities or check back later!
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyUserList;
