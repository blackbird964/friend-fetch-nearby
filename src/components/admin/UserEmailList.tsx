
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { formatMessageTime } from '@/utils/dateFormatters';

interface UserEmail {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

interface UserEmailResponse {
  total_users: number;
  users: UserEmail[];
}

const UserEmailList: React.FC = () => {
  const { toast } = useToast();
  const [emails, setEmails] = useState<UserEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUserEmails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-user-emails');
      
      if (error) {
        throw error;
      }

      const response: UserEmailResponse = data;
      setEmails(response.users);
      setTotalUsers(response.total_users);
      
      toast({
        title: "Success",
        description: `Found ${response.total_users} users`,
      });
    } catch (error: any) {
      console.error('Error fetching user emails:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user emails",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyEmailsToClipboard = () => {
    const emailList = emails.map(user => user.email).join('\n');
    navigator.clipboard.writeText(emailList);
    toast({
      title: "Copied",
      description: "Email list copied to clipboard",
    });
  };

  const exportToCSV = () => {
    const csvHeader = 'Email,User ID,Created At,Last Sign In,Email Confirmed\n';
    const csvRows = emails.map(user => 
      `${user.email},${user.id},${user.created_at},${user.last_sign_in_at || 'Never'},${user.email_confirmed_at || 'Not confirmed'}`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_emails.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Exported",
      description: "User emails exported to CSV",
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button onClick={fetchUserEmails} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Users'}
          </Button>
          {emails.length > 0 && (
            <>
              <Button variant="outline" onClick={copyEmailsToClipboard}>
                Copy Emails
              </Button>
              <Button variant="outline" onClick={exportToCSV}>
                Export CSV
              </Button>
            </>
          )}
        </div>
        
        {totalUsers > 0 && (
          <p className="text-sm text-gray-600 mb-4">
            Total users: {totalUsers}
          </p>
        )}
        
        {emails.length > 0 && (
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      {user.email_confirmed_at ? (
                        <span className="text-green-600 text-sm">Confirmed</span>
                      ) : (
                        <span className="text-yellow-600 text-sm">Unconfirmed</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.last_sign_in_at ? (
                        <span className="text-blue-600">{formatDate(user.last_sign_in_at)}</span>
                      ) : (
                        <span className="text-gray-500">Never logged in</span>
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

export default UserEmailList;
