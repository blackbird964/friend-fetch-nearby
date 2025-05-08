
import React, { useEffect } from 'react';
import { Slider } from "@/components/ui/slider";

type RadiusControlsProps = {
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
};

const RadiusControls: React.FC<RadiusControlsProps> = ({ 
  radiusInKm, 
  setRadiusInKm
}) => {
  // Log radius changes for debugging
  useEffect(() => {
    console.log("RadiusControls - Current radius:", radiusInKm);
  }, [radiusInKm]);

  const handleRadiusChange = (values: number[]) => {
    if (values.length === 0) return;
    
    const newRadius = values[0];
    console.log("Setting radius to:", newRadius);
    setRadiusInKm(newRadius);
    
    // Dispatch event to notify radius changed
    window.dispatchEvent(new CustomEvent('radius-changed', { detail: newRadius }));
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
