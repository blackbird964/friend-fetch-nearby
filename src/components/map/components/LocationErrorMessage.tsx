
import React from 'react';

interface LocationErrorMessageProps {
  locationError: string | null;
  permissionState: string;
  getSafariHelp: () => React.ReactNode | null;
}

const LocationErrorMessage: React.FC<LocationErrorMessageProps> = ({
  locationError,
  permissionState,
  getSafariHelp
}) => {
  if (!locationError) return null;

  return (
    <>
      {locationError && permissionState === 'denied' && (
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
