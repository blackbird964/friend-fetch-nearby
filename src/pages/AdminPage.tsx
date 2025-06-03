
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminStatistics from '@/components/admin/AdminStatistics';
import AdminReports from '@/components/admin/AdminReports';
import AdminUserList from '@/components/admin/AdminUserList';
import UserEmailList from '@/components/admin/UserEmailList';

// List of authorized admin emails
const ADMIN_EMAILS = ['harp.dylan@gmail.com', 'aaron.stathi@gmail.com'];

const AdminPage: React.FC = () => {
  const { currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<'stats' | 'reports' | 'users' | 'emails'>('stats');
  
  // Check if current user is authorized
  const isAuthorized = currentUser?.email && ADMIN_EMAILS.includes(currentUser.email);
  
  if (!isAuthorized) {
    return <Navigate to="/profile" replace />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6 mb-20 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'stats' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'reports' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          User Reports
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'users' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'emails' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Email List
        </button>
      </div>
      
      <div className="space-y-6">
        {activeTab === 'stats' && <AdminStatistics />}
        {activeTab === 'reports' && <AdminReports />}
        {activeTab === 'users' && <AdminUserList />}
        {activeTab === 'emails' && <UserEmailList />}
      </div>
    </div>
  );
};

export default AdminPage;
