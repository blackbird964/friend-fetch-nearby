
import React from 'react';

interface UserBasicInfoProps {
  name: string;
  age?: number | null;
  gender?: string | null;
  bio?: string | null;
  minimal?: boolean;
}

const UserBasicInfo: React.FC<UserBasicInfoProps> = ({ 
  name, 
  age, 
  gender, 
  bio, 
  minimal = false 
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
    </div>
  );
};

export default UserBasicInfo;
