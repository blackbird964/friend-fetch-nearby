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
  setMovingUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  completedMoves: Set<string>;
  setCompletedMoves: React.Dispatch<React.SetStateAction<Set<string>>>;
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
  // Function to calculate midpoint - keeping this for potential future use
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

  useEffect(() => {
    if (selectedUser) {
      const user = nearbyUsers.find(user => user.id === selectedUser);
      if (user && user.location) {
        // Move user logic - Fixed type issue by creating a new Set
        setMovingUsers(prev => {
          const newSet = new Set(prev);
          newSet.add(user.id);
          return newSet;
        });

        // Simulate user moving to midpoint but WITHOUT creating any route lines
        const timeoutId = setTimeout(() => {
          setCompletedMoves(prev => {
            const newSet = new Set(prev);
            newSet.add(user.id);
            return newSet;
          });
          setMovingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(user.id);
            return newSet;
          });
          setSelectedUser(null);
          
          // Ensure the route source is cleared
          const routeSource = routeLayer.current?.getSource();
          if (routeSource) {
            routeSource.clear();
          }
        }, selectedDuration * 1000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [selectedUser, nearbyUsers, selectedDuration, setMovingUsers, setCompletedMoves, setSelectedUser, WYNYARD_COORDS, routeLayer]);

  // Clear any existing route lines when component mounts
  useEffect(() => {
    if (routeLayer.current?.getSource()) {
      routeLayer.current.getSource().clear();
    }
  }, [routeLayer]);

  return null; // This component doesn't render UI directly
};

export default MeetingHandler;
