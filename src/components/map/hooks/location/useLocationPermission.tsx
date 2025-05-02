
import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export const useLocationPermission = () => {
  const [permissionState, setPermissionState] = useState<string>('prompt');

  // Check permission status on component mount
  useEffect(() => {
    // Check if the Permissions API is available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(permissionStatus => {
          setPermissionState(permissionStatus.state);
          
          // Set up a listener for permission changes
          permissionStatus.onchange = () => {
            setPermissionState(permissionStatus.state);
          };
        })
        .catch(error => {
          console.log("Permission query not supported", error);
        });
    }
  }, []);

  // Safari-specific help instructions
  const getSafariHelp = () => {
    if (permissionState === 'denied') {
      return (
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
        </div>
      );
    }
    return null;
  };

  return { permissionState, setPermissionState, getSafariHelp };
};
