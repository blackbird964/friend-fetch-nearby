
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  reporter_name?: string;
  reported_user_name?: string;
}

const AdminReports: React.FC = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);

  // For demonstration purposes, using mock data
  useEffect(() => {
    const mockReports: UserReport[] = [
      {
        id: '1',
        reporter_id: 'user1',
        reported_user_id: 'user2',
        reason: 'Inappropriate behavior',
        status: 'pending',
        created_at: '2025-05-10T09:00:00Z',
        reporter_name: 'John Doe',
        reported_user_name: 'Jane Smith'
      },
      {
        id: '2',
        reporter_id: 'user3',
        reported_user_id: 'user4',
        reason: 'Spam messages',
        status: 'resolved',
        created_at: '2025-05-09T14:30:00Z',
        reporter_name: 'Robert Johnson',
        reported_user_name: 'Michael Brown'
      },
      {
        id: '3',
        reporter_id: 'user5',
        reported_user_id: 'user6',
        reason: 'Fake profile',
        status: 'dismissed',
        created_at: '2025-05-08T11:20:00Z',
        reporter_name: 'Emily Wilson',
        reported_user_name: 'David Taylor'
      },
      {
        id: '4',
        reporter_id: 'user7',
        reported_user_id: 'user8',
        reason: 'Harassment',
        status: 'pending',
        created_at: '2025-05-10T16:45:00Z',
        reporter_name: 'Sophie Miller',
        reported_user_name: 'Thomas Anderson'
      }
    ];

    // Simulate loading
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 800);
  }, []);

  const handleStatusChange = (reportId: string, newStatus: 'resolved' | 'dismissed') => {
    // In a real application, we would update the database
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === reportId ? { ...report, status: newStatus } : report
      )
    );

    toast({
      title: "Report updated",
      description: `Report has been marked as ${newStatus}`,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Reports</CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-10">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
            <p className="mt-1 text-sm text-gray-500">No user reports have been submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reported User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(report.created_at)}</TableCell>
                    <TableCell>{report.reporter_name}</TableCell>
                    <TableCell>{report.reported_user_name}</TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      {report.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex items-center"
                            onClick={() => handleStatusChange(report.id, 'resolved')}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Resolve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex items-center"
                            onClick={() => handleStatusChange(report.id, 'dismissed')}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminReports;
