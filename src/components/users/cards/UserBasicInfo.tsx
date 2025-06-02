
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface UserBasicInfoProps {
  name: string;
  age?: number | null;
  gender?: string | null;
  bio?: string | null;
  minimal?: boolean;
  todayActivities?: string[];
  preferredHangoutDuration?: string;
}

const UserBasicInfo: React.FC<UserBasicInfoProps> = ({ 
  name, 
  age, 
  gender, 
  bio, 
  minimal = false,
  todayActivities,
  preferredHangoutDuration
}) => {
  return (
    <div>
      <h3 className={`${minimal ? 'text-sm' : 'text-base'} font-medium`}>{name}</h3>
      
      {(age || gender) && (
        <div className="flex items-center mt-1">
          <span className="text-xs text-gray-500 mr-2">
            {age && gender ? `${age} • ${gender}` : age || gender}
          </span>
        </div>
      )}
      
      {!minimal && bio && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{bio}</p>
      )}

      {!minimal && todayActivities && todayActivities.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Wants to do today:</p>
          <div className="flex flex-wrap gap-1">
            {todayActivities.slice(0, 3).map((activity) => (
              <Badge key={activity} variant="outline" className="text-xs">
                {activity}
              </Badge>
            ))}
            {todayActivities.length > 3 && (
              <span className="text-xs text-gray-500">+{todayActivities.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {!minimal && preferredHangoutDuration && (
        <div className="mt-1">
          <span className="text-xs text-gray-500">
            Duration: {preferredHangoutDuration} min
          </span>
        </div>
      )}
    </div>
  );
};

export default UserBasicInfo;
