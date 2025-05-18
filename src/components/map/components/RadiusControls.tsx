
import React, { useCallback } from 'react';
import { Slider } from "@/components/ui/slider";
import { throttle } from 'lodash';

type RadiusControlsProps = {
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
};

const RadiusControls: React.FC<RadiusControlsProps> = ({ 
  radiusInKm, 
  setRadiusInKm
}) => {
  // Use throttle to improve performance when slider is moving
  const throttledRadiusChange = useCallback(
    throttle((values: number[]) => {
      if (values.length === 0) return;
      
      const newRadius = values[0];
      if (newRadius === radiusInKm) return; // Prevent unnecessary updates
      
      // Update radius value
      setRadiusInKm(newRadius);
      
      // Dispatch event to notify radius changed - this will trigger circle update
      window.dispatchEvent(new CustomEvent('radius-changed', { detail: newRadius }));
      console.log(`Radius changed to ${newRadius}km - event dispatched`);
    }, 50, { leading: true, trailing: true }), // Use both leading and trailing for smooth update
    [setRadiusInKm, radiusInKm]
  );

  // Handle immediate UI feedback while ensuring throttled backend updates
  const handleRadiusChange = (values: number[]) => {
    if (values.length === 0) return;
    throttledRadiusChange(values);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Search Radius: {radiusInKm} km</div>
      </div>
      <Slider 
        value={[radiusInKm]} 
        min={1} 
        max={100}
        step={1}
        onValueChange={handleRadiusChange}
        className="py-1"
      />
    </div>
  );
};

export default RadiusControls;
