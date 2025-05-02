
import React from 'react';

interface EmptyUserListProps {
  hasLocation: boolean;
}

const EmptyUserList: React.FC<EmptyUserListProps> = ({ hasLocation }) => {
  return (
    <div className="text-center py-8 text-gray-500">
      <p className="mb-2">No users found nearby. Try increasing your radius or refreshing.</p>
      {!hasLocation && (
        <p className="text-sm text-amber-600">Enable location access to find people near you.</p>
      )}
    </div>
  );
};

export default EmptyUserList;
