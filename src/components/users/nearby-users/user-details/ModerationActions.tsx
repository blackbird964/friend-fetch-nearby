
import React from 'react';
import { Button } from "@/components/ui/button";
import { Ban, Flag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ModerationActionsProps {
  isBlocked: boolean;
  onBlock: () => void;
  onReport: () => void;
  show: boolean;
}

const ModerationActions: React.FC<ModerationActionsProps> = ({ isBlocked, onBlock, onReport, show }) => {
  if (!show) return null;
  
  return (
    <>
      <Separator className="my-2" />
      <div className="flex gap-3 w-full">
        <Button 
          onClick={onBlock} 
          variant="outline"
          className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
        >
          <Ban className="mr-2 h-4 w-4" />
          {isBlocked ? "Unblock" : "Block"}
        </Button>
        <Button 
          onClick={onReport} 
          variant="outline" 
          className="flex-1 text-amber-600 border-amber-600 hover:bg-amber-600/10"
        >
          <Flag className="mr-2 h-4 w-4" />
          Report
        </Button>
      </div>
    </>
  );
};

export default ModerationActions;
