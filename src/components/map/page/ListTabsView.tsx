
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import UserList from '@/components/users/UserList';

const ListTabsView: React.FC = () => {
  return (
    <TabsContent value="list" className="pt-4">
      <div className="bg-white rounded-lg shadow-md p-4 overflow-auto max-h-[calc(100vh-300px)]">
        <UserList />
      </div>
    </TabsContent>
  );
};

export default ListTabsView;
