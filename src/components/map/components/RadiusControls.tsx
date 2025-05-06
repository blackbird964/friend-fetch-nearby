
import React from 'react';
import { Slider } from "@/components/ui/slider";

type RadiusControlsProps = {
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
};

const RadiusControls: React.FC<RadiusControlsProps> = ({ 
  radiusInKm, 
  setRadiusInKm
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Search Radius: {radiusInKm} km</div>
      </div>
      <div>
        <Slider 
          value={[radiusInKm]} 
          min={1} 
          max={100}
          step={1}
          onValueChange={([value]) => {
            console.log("Setting radius to:", value);
            setRadiusInKm(value);
          }} 
          className="py-1"
        />
      </div>
    </div>
  );
};

export default RadiusControls;
