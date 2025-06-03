
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Email List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button onClick={fetchUserEmails} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch User Emails'}
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
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {emails.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <span className="font-medium">{user.email}</span>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(user.created_at).toLocaleDateString()}
                      {user.last_sign_in_at && (
                        <span className="ml-2">
                          Last login: {new Date(user.last_sign_in_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs">
                    {user.email_confirmed_at ? (
                      <span className="text-green-600">Confirmed</span>
                    ) : (
                      <span className="text-yellow-600">Unconfirmed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserEmailList;
