import React, { useEffect } from 'react';
import { LineString } from 'ol/geom';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Style, Stroke } from 'ol/style';
import { fromLonLat, transform } from 'ol/proj';
import { AppUser } from '@/context/types';

type MeetingHandlerProps = {
  vectorSource: React.MutableRefObject<VectorSource | null>;
  routeLayer: React.MutableRefObject<any>;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
  movingUsers: Set<string>;
  setMovingUsers: (users: Set<string>) => void;
  completedMoves: Set<string>;
  setCompletedMoves: (users: Set<string>) => void;
  nearbyUsers: AppUser[];
  WYNYARD_COORDS: [number, number];
};

const MeetingHandler: React.FC<MeetingHandlerProps> = ({
  vectorSource,
  routeLayer,
  selectedUser,
  setSelectedUser,
  selectedDuration,
  setSelectedDuration,
  movingUsers,
  setMovingUsers,
  completedMoves,
  setCompletedMoves,
  nearbyUsers,
  WYNYARD_COORDS
}) => {
  // Function to calculate midpoint
  const calculateMidpoint = (coord1: [number, number], coord2: [number, number]): [number, number] => {
    const lat1 = coord1[1] * Math.PI / 180;
    const lon1 = coord1[0] * Math.PI / 180;
    const lat2 = coord2[1] * Math.PI / 180;
    const lon2 = coord2[0] * Math.PI / 180;

    const bx = Math.cos(lat2) * Math.cos(lon2 - lon1);
    const by = Math.cos(lat2) * Math.sin(lon2 - lon1);
    const latMid = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by));
    const lonMid = lon1 + Math.atan2(by, Math.cos(lat1) + bx);

    return [lonMid * 180 / Math.PI, latMid * 180 / Math.PI];
  };

  // Function to create a route line
  const createRouteLine = (start: [number, number], end: [number, number]) => {
    const line = new LineString([start, end]);
    line.transform('EPSG:4326', 'EPSG:3857');
    return new Feature({ geometry: line });
  };

  // Function to add the route to the map
  const addRouteToMap = (route: Feature) => {
    const routeSource = routeLayer.current?.getSource();
    routeSource?.clear();
    routeSource?.addFeature(route);
  };

  // Function to create a style for the route line
  const createRouteStyle = () => {
    return new Style({
      stroke: new Stroke({
        color: '#ff0000',
        width: 2,
      }),
    });
  };

  useEffect(() => {
    if (selectedUser) {
      const user = nearbyUsers.find(user => user.id === selectedUser);
      if (user && user.location) {
        //console.log(`Meeting Duration: ${selectedDuration} minutes`);

        const userCoords = [user.location.lng, user.location.lat] as [number, number];
        const wynyardCoords = WYNYARD_COORDS;

        // Calculate the midpoint
        const midpointCoords = calculateMidpoint(userCoords, wynyardCoords);
        //console.log("Midpoint coordinates:", midpointCoords);

        // Create a route line
        const route = createRouteLine(userCoords, wynyardCoords);

        // Style the route line
        const routeStyle = createRouteStyle();
        route.setStyle(routeStyle);

        // Add the route to the map
        addRouteToMap(route);

        // Move user logic
        setMovingUsers(prev => new Set(prev).add(user.id));

        // Simulate user moving to midpoint
        const timeoutId = setTimeout(() => {
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
          setSelectedUser(null);
          const routeSource = routeLayer.current?.getSource();
          routeSource?.clear();
        }, selectedDuration * 1000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [selectedUser, nearbyUsers, selectedDuration, setMovingUsers, setCompletedMoves, setSelectedUser, WYNYARD_COORDS, routeLayer]);

  return null; // This component doesn't render UI directly
};

export default MeetingHandler;
