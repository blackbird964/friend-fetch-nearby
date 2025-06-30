
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
  interests?: string[];
}

const UserBasicInfo: React.FC<UserBasicInfoProps> = ({ 
  name, 
  age, 
  gender, 
  bio, 
  minimal = false,
  todayActivities,
  preferredHangoutDuration,
  interests
}) => {
  const formatAge = (age: number | null | undefined) => {
    if (!age || isNaN(age)) return null;
    return age;
  };

  const formatDuration = (duration: string | undefined) => {
    if (!duration || duration === 'NaN') return null;
    return duration;
  };

  return (
    <div>
      <h3 className={`${minimal ? 'text-sm' : 'text-base'} font-medium`}>{name}</h3>
      
      {(formatAge(age) || gender) && (
        <div className="flex items-center mt-1">
          <span className="text-xs text-gray-500 mr-2">
            {[formatAge(age), gender].filter(Boolean).join(' • ')}
          </span>
        </div>
      )}
      
      {!minimal && bio && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{bio}</p>
      )}

      {!minimal && todayActivities && todayActivities.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">I am looking for:</p>
          <div className="flex flex-wrap gap-1">
            {todayActivities.slice(0, 3).map((activity) => (
              <Badge key={activity} variant="default" className="text-xs bg-blue-500 text-white hover:bg-blue-600">
                {activity}
              </Badge>
            ))}
            {todayActivities.length > 3 && (
              <span className="text-xs text-gray-500">+{todayActivities.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {!minimal && formatDuration(preferredHangoutDuration) && (
        <div className="mt-1">
          <span className="text-xs text-gray-500">
            Duration: {formatDuration(preferredHangoutDuration)} min
          </span>
        </div>
      )}

      {!minimal && interests && interests.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">I am into:</p>
          <div className="flex flex-wrap gap-1">
            {interests.slice(0, 4).map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
            {interests.length > 4 && (
              <span className="text-xs text-gray-500">+{interests.length - 4}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBasicInfo;
