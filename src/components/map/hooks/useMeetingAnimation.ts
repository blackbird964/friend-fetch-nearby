import { useRef } from 'react';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import { AppUser } from '@/context/types';
import { useToast } from '@/components/ui/use-toast';

export const useMeetingAnimation = (
  vectorSource: React.MutableRefObject<VectorSource | null>,
  routeLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>,
  setMovingUsers: React.Dispatch<React.SetStateAction<Set<string>>>,
  setCompletedMoves: React.Dispatch<React.SetStateAction<Set<string>>>,
  setSelectedUser: React.Dispatch<React.SetStateAction<string | null>>,
  meetingCoords: [number, number]
) => {
  const { toast } = useToast();
  const ANIMATION_DURATION = 3000; // 3 seconds

  const animateUserToMeeting = (user: AppUser, selectedDuration: number) => {
    if (!user || !vectorSource.current || !routeLayer.current?.getSource()) return;

    setMovingUsers(prev => new Set(prev).add(user.id));
    
    // Find the user's feature in the map
    const userFeature = vectorSource.current.getFeatures().find(f => f.get('userId') === user.id);
    if (!userFeature) return;
    
    const startCoord = (userFeature.getGeometry() as Point).getCoordinates();
    const endCoord = fromLonLat(meetingCoords);
    
    // Add route line
    const routeFeature = new Feature({
      geometry: new LineString([startCoord, endCoord])
    });
    routeLayer.current.getSource()?.addFeature(routeFeature);
    
    let startTime: number | null = null;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      
      // Add bounce effect
      const bounce = Math.sin(progress * Math.PI * 8) * 0.0001;
      
      const currentCoord = [
        startCoord[0] + (endCoord[0] - startCoord[0]) * progress,
        startCoord[1] + (endCoord[1] - startCoord[1]) * progress + bounce
      ];
      
      userFeature.setGeometry(new Point(currentCoord));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCompletedMoves(prev => {
          const next = new Set(prev);
          next.add(user.id);
          return next;
        });
        
        setMovingUsers(prev => {
          const next = new Set(prev);
          next.delete(user.id);
          return next;
        });
        
        // Keep marker at final position
        userFeature.setGeometry(new Point(endCoord));
        
        // Clear route line after delay
        setTimeout(() => {
          routeLayer.current?.getSource()?.clear();
        }, 1000);

        // Show confirmation toast with selected duration
        toast({
          title: "Catch up confirmed!",
          description: `Meeting ${user.name} at Wynyard for ${selectedDuration} minutes.`,
        });
      }
    };
    
    requestAnimationFrame(animate);
    setSelectedUser(null);
  };

  return { animateUserToMeeting };
};
