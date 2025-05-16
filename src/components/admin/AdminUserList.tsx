
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
import { Badge } from "@/components/ui/badge";
import UserAvatar from '@/components/users/cards/UserAvatar';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { AppUser } from '@/context/types';
import { formatDistanceToNow } from 'date-fns';

const AdminUserList: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Transform to AppUser format
        const appUsers = data.map(profile => ({
          id: profile.id,
          name: profile.name || 'Unknown',
          bio: profile.bio || '',
          age: profile.age || null,
          gender: profile.gender || '',
          interests: profile.interests || [],
          profile_pic: profile.profile_pic || null,
          email: '', // Email not stored in profiles table
          location: profile.location ? { 
            // Safely type cast the location object and access properties
            lat: (profile.location as { x?: number, y?: number })?.y || 0, 
            lng: (profile.location as { x?: number, y?: number })?.x || 0 
          } : undefined,
          is_over_18: profile.is_over_18 || false,
          isOnline: profile.is_online || false,
          last_seen: profile.last_seen || null,
          created_at: profile.created_at || null,
          blockedUsers: profile.blocked_users || [],
        })) as AppUser[];
        
        setUsers(appUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Failed to load users",
          description: "There was an error loading the user list",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const getLastActive = (user: AppUser) => {
    if (user.isOnline) return 'Online now';
    // Access the last_seen property from the AppUser type
    // The property exists in the context/types.ts interface
    if (user.last_seen) {
      // Type assertion to string because we know it's a string when it exists
      return formatDistanceToNow(new Date(user.last_seen as unknown as string), { addSuffix: true });
    }
    return 'Unknown';
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Demographics</TableHead>
                <TableHead>Interests</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <UserAvatar src={user.profile_pic} alt={user.name || ''} size="sm" />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">
                          {user.bio || 'No bio provided'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.age && user.gender ? (
                      <span>{user.age} • {user.gender}</span>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {user.interests && user.interests.length > 0 ? (
                        user.interests.slice(0, 3).map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                      {user.interests && user.interests.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.interests.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`text-sm ${user.isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                      {getLastActive(user)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.isOnline ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Online</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Offline</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUserList;
