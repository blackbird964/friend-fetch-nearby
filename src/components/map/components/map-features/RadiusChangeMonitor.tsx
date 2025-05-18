
import React, { useEffect } from 'react';

interface RadiusChangeMonitorProps {
  radiusInKm: number;
}

const RadiusChangeMonitor: React.FC<RadiusChangeMonitorProps> = ({
  radiusInKm
}) => {
  // Listen for radius changes from slider or other components
  useEffect(() => {
    console.log("RadiusChangeMonitor - radiusInKm changed:", radiusInKm);
    
    const handleRadiusChange = (e: any) => {
      const customEvent = e as CustomEvent;
      console.log("RadiusChangeMonitor - Radius change event detected:", customEvent.detail);
    };
    
    window.addEventListener('radius-changed', handleRadiusChange);
    
    return () => {
      window.removeEventListener('radius-changed', handleRadiusChange);
    };
  }, [radiusInKm]);

  return null;
};

export default RadiusChangeMonitor;
