
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface MapPageHeaderProps {
  loading: boolean;
  handleRefresh: (e: React.MouseEvent) => Promise<void>;
}

const MapPageHeader: React.FC<MapPageHeaderProps> = ({ loading, handleRefresh }) => {
  // Create a new handler that properly stops propagation
  const onRefreshClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleRefresh(e);
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">Find Friends Nearby</h1>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefreshClick}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
};

export default MapPageHeader;
