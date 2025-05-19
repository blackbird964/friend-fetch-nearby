
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
  // Clear any existing route lines when component mounts or selectedUser changes
  useEffect(() => {
    console.log("[MeetingHandler] Clearing any existing routes");
    if (routeLayer.current?.getSource()) {
      routeLayer.current.getSource().clear();
    }
    
    // CRITICAL FIX: Make sure this component no longer tries to handle state
    return () => {
      console.log("[MeetingHandler] Component unmounting");
      if (routeLayer.current?.getSource()) {
        routeLayer.current.getSource().clear();
      }
    };
  }, [routeLayer, selectedUser]);

  return null; // This component doesn't render UI directly
};

export default MeetingHandler;
