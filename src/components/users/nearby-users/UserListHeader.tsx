
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface UserListHeaderProps {
  userCount: number;
  radiusInKm: number;
  loading: boolean;
  onRefresh: () => void;
}

const UserListHeader: React.FC<UserListHeaderProps> = ({
  userCount,
  radiusInKm,
  loading,
  onRefresh
}) => {
  const { currentUser } = useAppContext();
  
  // Check if user has selected activities
  const hasSelectedActivities = currentUser?.todayActivities && currentUser.todayActivities.length > 0;
  
  const getHeaderText = () => {
    if (!hasSelectedActivities) {
      return `People nearby (${userCount})`;
    }
    return `People nearby with same activities as you (${userCount})`;
  };

  const getSubText = () => {
    if (!hasSelectedActivities) {
      return `Select activities above to find people with shared interests within ${radiusInKm}km radius`;
    }
    return `Within ${radiusInKm}km radius • Sharing: ${currentUser?.todayActivities?.join(', ')}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{getHeaderText()}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{getSubText()}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 ml-4"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

export default UserListHeader;
