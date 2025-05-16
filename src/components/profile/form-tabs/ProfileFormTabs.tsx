
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileFormTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  basicInfoContent: React.ReactNode;
  prioritiesContent: React.ReactNode;
}

const ProfileFormTabs: React.FC<ProfileFormTabsProps> = ({
  activeTab,
  onTabChange,
  basicInfoContent,
  prioritiesContent
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="priorities">Active Priorities</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-4 mt-4">
        {basicInfoContent}
      </TabsContent>
      
      <TabsContent value="priorities" className="mt-4">
        {prioritiesContent}
      </TabsContent>
    </Tabs>
  );
};

export default ProfileFormTabs;
