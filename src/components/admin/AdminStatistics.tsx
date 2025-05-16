
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description }) => (
  <Card className="shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </CardContent>
  </Card>
);

const AdminStatistics: React.FC = () => {
  const { toast } = useToast();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Mock data for demonstration
  const pageVisitData = [
    { name: 'Home', visits: 320 },
    { name: 'Map', visits: 480 },
    { name: 'Chat', visits: 400 },
    { name: 'Profile', visits: 200 },
    { name: 'Friends', visits: 280 },
  ];

  const genderData = [
    { name: 'Male', value: 60 },
    { name: 'Female', value: 35 },
    { name: 'Other', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Count total users
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (error) throw error;
        setTotalUsers(count || 0);
      } catch (error) {
        console.error('Error fetching admin statistics:', error);
        toast({
          title: "Failed to load statistics",
          description: "There was an error loading admin statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [toast]);

  if (loading) {
    return <div className="text-center py-8">Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Users" 
          value={totalUsers} 
          description="Total registered users in the platform"
        />
        <StatCard 
          title="Average Session" 
          value="14.2 min" 
          description="Average time spent per session"
        />
        <StatCard 
          title="Daily Active Users" 
          value="124" 
          description="Users active in the last 24 hours"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pageVisitData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="visits" fill="#8884d8" name="Page Visits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Friend Requests Sent</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Messages Sent</span>
                  <span className="font-medium">82%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Profile Completion</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStatistics;
