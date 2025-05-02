
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppUser } from '@/context/types';
import { fromLonLat } from 'ol/proj';
import Map from 'ol/Map';
import { AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const useGeolocation = (
  map: React.MutableRefObject<Map | null>,
  currentUser: AppUser | null,
  updateUserLocation: (userId: string, location: { lat: number, lng: number }) => Promise<any>,
  setCurrentUser: (user: AppUser | null) => void
) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('prompt');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const locationToastShown = useRef<boolean>(false);
  const lastUpdateTime = useRef<number>(0);
  const isUpdatingRef = useRef<boolean>(false);

  // Default location for Wynyard
  const DEFAULT_LOCATION = { lat: -33.8666, lng: 151.2073 };

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
            
            // If permission is granted after a change, try to get location again
            if (permissionStatus.state === 'granted') {
              getUserLocation();
            }
          };
        })
        .catch(error => {
          console.log("Permission query not supported", error);
        });
    }
  }, []);

  // Request user location
  const getUserLocation = () => {
    // Prevent multiple simultaneous location requests
    if (isUpdatingRef.current) {
      console.log("Location update already in progress, ignoring request");
      return;
    }
    
    // Throttle location updates to prevent flickering
    const now = Date.now();
    const minimumUpdateInterval = 2000; // 2 seconds minimum between updates
    
    if (now - lastUpdateTime.current < minimumUpdateInterval) {
      console.log("Location update throttled, ignoring request");
      return;
    }
    
    lastUpdateTime.current = now;
    isUpdatingRef.current = true;
    setIsLocating(true);
    setLocationError(null);
    
    // First, check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      isUpdatingRef.current = false;
      useDefaultLocation();
      return;
    }
    
    // For Safari and iOS specifically, we need to make a more explicit request
    // to make sure the permission dialog appears
    const positionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
    
    console.log("Requesting geolocation permission...");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        console.log("Location obtained:", latitude, longitude);
        setUserLocation([longitude, latitude]);
        
        // If we have a current user, update their location in the database
        if (currentUser) {
          const newLocation = { lat: latitude, lng: longitude };
          updateUserLocation(currentUser.id, newLocation).finally(() => {
            isUpdatingRef.current = false;
          });
          
          // Update the current user state with the new location
          setCurrentUser({
            ...currentUser,
            location: newLocation
          });
        } else {
          isUpdatingRef.current = false;
        }
        
        setIsLocating(false);
        setPermissionState('granted');
        
        // Center the map on the user's location
        if (map.current) {
          map.current.getView().animate({
            center: fromLonLat([longitude, latitude]),
            duration: 1000,
            zoom: 14
          });
        }
        
        // Only show toast on desktop and only once per session
        if (!isMobile && !locationToastShown.current) {
          toast({
            title: "Location Updated",
            description: "Your current location has been updated on the map.",
          });
          locationToastShown.current = true;
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Unable to retrieve your location.";
        
        if (error.code === 1) {
          // Permission denied
          setPermissionState('denied');
          errorMessage = "Location permission denied. Please enable location services for this website in your browser settings.";
        } else if (error.code === 2) {
          // Position unavailable
          errorMessage = "Your location information is unavailable. Please check your device settings.";
        } else if (error.code === 3) {
          // Timeout
          errorMessage = "Location request timed out. Please try again.";
        }
        
        setLocationError(errorMessage);
        setIsLocating(false);
        isUpdatingRef.current = false;
        
        // Use default location
        useDefaultLocation();
      },
      positionOptions
    );
  };

  // Apply default location when geolocation fails or is denied
  const useDefaultLocation = () => {
    if (currentUser && (!currentUser.location || !currentUser.location.lat || !currentUser.location.lng)) {
      updateUserLocation(currentUser.id, DEFAULT_LOCATION);
      setCurrentUser({
        ...currentUser,
        location: DEFAULT_LOCATION
      });
      
      // Always show this toast as it's important for the user to know
      // But only once per session
      if (!locationToastShown.current) {
        toast({
          title: "Default Location Used",
          description: "Using Wynyard as your location. Enable location access for accuracy.",
          variant: "destructive"
        });
        locationToastShown.current = true;
      }
    }
  };

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

  return {
    getUserLocation,
    isLocating,
    locationError,
    permissionState,
    getSafariHelp,
    DEFAULT_LOCATION
  };
};
