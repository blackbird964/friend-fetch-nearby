
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface UserListHeaderProps {
  userCount: number;
  radiusInKm: number;
  loading: boolean;
  onRefresh: () => Promise<void>;
}

const UserListHeader: React.FC<UserListHeaderProps> = ({
  userCount,
  radiusInKm,
  loading,
  onRefresh
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">People Nearby ({userCount})</h2>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Radius: {radiusInKm} km</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default UserListHeader;
