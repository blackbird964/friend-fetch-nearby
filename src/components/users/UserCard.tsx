
import React from 'react';
import { User } from '@/context/AppContext';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin } from 'lucide-react';

interface UserCardProps {
  user: User;
  minimal?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, minimal = false }) => {
  if (minimal) {
    return (
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={user.profilePic} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-lg">{user.name}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {user.interests.slice(0, 3).map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
            {user.interests.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{user.interests.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48">
        <img
          src={user.profilePic}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{user.name}</h3>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            <span>Nearby</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
          <span>{user.age} years</span>
          <span>•</span>
          <span>{user.gender}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{user.bio}</p>
        
        <div className="flex flex-wrap gap-1 mt-1">
          {user.interests.map((interest) => (
            <Badge key={interest} variant="secondary" className="text-xs">
              {interest}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
