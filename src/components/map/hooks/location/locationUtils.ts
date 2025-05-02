
import { AppUser } from '@/context/types';
import { useToast } from '@/hooks/use-toast';

// Default location for Wynyard
export const DEFAULT_LOCATION = { lat: -33.8666, lng: 151.2073 };

// Apply default location when geolocation fails or is denied
export const useDefaultLocation = (
  currentUser: AppUser | null,
  updateUserLocation: (userId: string, location: { lat: number, lng: number }) => Promise<any>,
  setCurrentUser: (user: AppUser | null) => void,
  locationToastShown: React.MutableRefObject<boolean>,
  toast: ReturnType<typeof useToast>['toast']
) => {
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

// Format error messages for location errors
export const formatLocationErrorMessage = (error: GeolocationPositionError): string => {
  let errorMessage = "Unable to retrieve your location.";
  
  if (error.code === 1) {
    // Permission denied
    errorMessage = "Location permission denied. Please enable location services for this website in your browser settings.";
  } else if (error.code === 2) {
    // Position unavailable
    errorMessage = "Your location information is unavailable. Please check your device settings.";
  } else if (error.code === 3) {
    // Timeout
    errorMessage = "Location request timed out. Please try again.";
  }
  
  return errorMessage;
};
