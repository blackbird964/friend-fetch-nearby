
import React from 'react';
import { Clock } from 'lucide-react';

const EmptyCheckInsState: React.FC = () => {
  return (
    <div className="text-center py-10">
      <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">No recent interactions</h3>
      <p className="text-gray-500">
        Your check-ins will appear here after you chat with someone new
      </p>
    </div>
  );
};

export default EmptyCheckInsState;
