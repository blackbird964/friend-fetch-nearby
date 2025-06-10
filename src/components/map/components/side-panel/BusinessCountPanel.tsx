
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface BusinessCountPanelProps {
  businessCount: number;
  radiusInKm: number;
}

const BusinessCountPanel: React.FC<BusinessCountPanelProps> = ({
  businessCount,
  radiusInKm
}) => {
  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">Partner Businesses</h4>
          <p className="text-sm text-gray-600">
            {businessCount} {businessCount === 1 ? 'business' : 'businesses'} within {radiusInKm}km
          </p>
        </div>
        <Badge variant={businessCount > 0 ? "default" : "secondary"} className="ml-2">
          {businessCount}
        </Badge>
      </div>
    </div>
  );
};

export default BusinessCountPanel;
