
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

interface MapPageHeaderProps {
  loading: boolean;
  handleRefresh: () => Promise<void>;
}

const MapPageHeader: React.FC<MapPageHeaderProps> = ({ loading, handleRefresh }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Find Friends Nearby</h1>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default MapPageHeader;
