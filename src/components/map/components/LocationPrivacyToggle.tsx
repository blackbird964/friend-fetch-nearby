
import React from 'react';
import { EyeOff, Eye } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type LocationPrivacyToggleProps = {
  isPrivacyModeEnabled: boolean;
  togglePrivacyMode: () => void;
};

const LocationPrivacyToggle: React.FC<LocationPrivacyToggleProps> = ({
  isPrivacyModeEnabled,
  togglePrivacyMode
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            aria-label="Toggle location privacy"
            pressed={isPrivacyModeEnabled}
            onClick={togglePrivacyMode}
            variant="outline"
            className={`ml-2 ${isPrivacyModeEnabled ? 'bg-blue-100 border-blue-300' : ''}`}
          >
            <div className="flex items-center gap-1">
              {isPrivacyModeEnabled ? (
                <>
                  <EyeOff className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-600">Approx</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span className="text-xs">Exact</span>
                </>
              )}
            </div>
          </Toggle>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium">{isPrivacyModeEnabled ? 'Privacy Mode: ON' : 'Privacy Mode: OFF'}</p>
          <p className="text-xs text-gray-500">
            {isPrivacyModeEnabled 
              ? 'Others see approximate location within 50m' 
              : 'Others see your exact location'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LocationPrivacyToggle;
