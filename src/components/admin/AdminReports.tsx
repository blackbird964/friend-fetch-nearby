
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
import { format } from 'date-fns';

interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  timestamp: number;
  created_at: string;
  reporter_name?: string;
  reported_user_name?: string;
}

const AdminReports: React.FC = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        
        // Fetch all messages with type 'user_report'
        const { data: reportMessages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('receiver_id', 'admin')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (!reportMessages || reportMessages.length === 0) {
          setReports([]);
          return;
        }
        
        const fetchedReports: UserReport[] = [];
        
        // Process each report message
        for (const message of reportMessages) {
          try {
            const content = JSON.parse(message.content);
            
            if (content.type === 'user_report') {
              // Fetch reporter name
              const { data: reporter } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', message.sender_id)
                .single();
                
              // Fetch reported user name
              const { data: reportedUser } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', content.reported_user_id)
                .single();
              
              fetchedReports.push({
                id: message.id,
                reporter_id: message.sender_id,
                reported_user_id: content.reported_user_id,
                reason: content.reason,
                status: content.status || 'pending',
                timestamp: content.timestamp,
                created_at: message.created_at,
                reporter_name: reporter?.name || 'Unknown User',
                reported_user_name: reportedUser?.name || 'Unknown User'
              });
            }
          } catch (parseError) {
            console.error('Error parsing report message:', parseError);
          }
        }
        
        setReports(fetchedReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast({
          title: "Failed to load reports",
          description: "There was an error loading the user reports",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [toast]);

  const handleStatusChange = async (reportId: string, newStatus: 'resolved' | 'dismissed') => {
    try {
      // Find the report message
      const report = reports.find(r => r.id === reportId);
      if (!report) return;
      
      // Get the original message to update
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('content')
        .eq('id', reportId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Parse the content, update the status
      const content = JSON.parse(message.content);
      content.status = newStatus;
      
      // Update the message with the new status
      const { error: updateError } = await supabase
        .from('messages')
        .update({ 
          content: JSON.stringify(content),
          read: true
        })
        .eq('id', reportId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
      
      toast({
        title: "Report updated",
        description: `Report has been marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Failed to update report",
        description: "There was an error updating the report status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
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
