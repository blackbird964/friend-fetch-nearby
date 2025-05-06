
import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationErrorMessageProps {
  locationError: string | null;
  permissionState: string;
  getSafariHelp: () => React.ReactNode | null;
  isManualMode: boolean;
}

const LocationErrorMessage: React.FC<LocationErrorMessageProps> = ({
  locationError,
  permissionState,
  getSafariHelp,
  isManualMode
}) => {
  if (!locationError) return null;

  // Show manual mode alternative message when location access is denied
  if (isManualMode && permissionState === 'denied') {
    return (
      <div className="absolute top-16 right-4 left-4 z-10">
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-sm mb-4">
          <h4 className="font-medium flex items-center text-amber-800 mb-1">
            <MapPin className="h-4 w-4 mr-1" />
            Manual Location Mode Active
          </h4>
          <p className="text-amber-700 mb-2">
            You're in manual mode. You can set your location by clicking anywhere on the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {locationError && permissionState === 'denied' && !isManualMode && (
        <div className="absolute top-16 right-4 left-4 z-10">
          {getSafariHelp()}
        </div>
      )}
      
      {locationError && permissionState !== 'denied' && (
        <div className="absolute top-16 right-4 z-10 bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-md text-sm max-w-xs">
          {locationError}
        </div>
      )}
    </>
  );
};

export default LocationErrorMessage;
