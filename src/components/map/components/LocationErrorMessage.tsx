
import React from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';

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
      <div className="absolute top-4 right-4 left-4 z-10">
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
        <div className="absolute top-4 right-4 left-4 z-10">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-sm mb-4">
            <h4 className="font-medium flex items-center text-amber-800 mb-1">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Location Access Required
            </h4>
            <p className="text-amber-700 mb-2">To see people nearby, please enable location access:</p>
            <ol className="list-decimal list-inside text-amber-700 space-y-1 pl-1">
              <li>Go to <strong>Settings</strong> on your device</li>
              <li>Scroll down and tap <strong>Safari</strong></li>
              <li>Tap <strong>Settings for Websites</strong></li>
              <li>Tap <strong>Location</strong></li>
              <li>Set to <strong>Allow</strong> for this website</li>
            </ol>
            <p className="text-amber-700 mt-2">After enabling, refresh this page and try again.</p>
            <p className="text-amber-700 mt-3 font-medium">
              <MapPin className="h-4 w-4 inline mr-1" />
              Alternatively, you can use the <strong>Manual</strong> toggle button above to set your location manually on the map.
            </p>
          </div>
          {getSafariHelp()}
        </div>
      )}
      
      {locationError && permissionState !== 'denied' && (
        <div className="absolute top-4 right-4 z-10 bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-md text-sm max-w-xs">
          {locationError}
        </div>
      )}
    </>
  );
};

export default LocationErrorMessage;
