
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { FriendRequest } from '@/context/types';

export const createUserMarkerStyle = (
  feature: Feature<Geometry>,
  selectedUser: string | null,
  movingUsers: Set<string>,
  completedMoves: Set<string>,
  friendRequests: FriendRequest[]
) => {
  const userId = feature.get('userId');
  const isMoving = movingUsers.has(userId);
  const isUser = feature.get('isCurrentUser');
  const hasMoved = completedMoves.has(userId);
  const isPrivacyEnabled = feature.get('isPrivacyEnabled');
  
  // Check if there are any pending friend requests for this user
  const sentRequest = friendRequests.find(req => 
    req.status === 'pending' && 
    req.receiverId === userId
  );
  
  const receivedRequest = friendRequests.find(req => 
    req.status === 'pending' && 
    req.senderId === userId
  );
  
  const isAcceptedFriend = friendRequests.find(req => 
    req.status === 'accepted' && 
    (req.senderId === userId || req.receiverId === userId)
  );
  
  // Determine marker color based on status
  let markerColor = '#6366f1'; // Default purple color
  
  if (isUser) {
    markerColor = '#0ea5e9'; // Blue for current user
  } else if (isMoving || hasMoved) {
    markerColor = '#10b981'; // Green for moving/completed users
  } else if (isAcceptedFriend) {
    markerColor = '#10b981'; // Green for accepted friends
  } else if (sentRequest) {
    markerColor = '#fef08a'; // Yellow for sent requests
  } else if (receivedRequest) {
    markerColor = '#fef08a'; // Yellow for received requests
  } else if (selectedUser === userId) {
    markerColor = '#6366f1'; // Purple for selected users
  }
  
  // For privacy mode users, show only a small marker without text
  if (isPrivacyEnabled && !isUser) {
    return new Style({
      image: new CircleStyle({
        radius: 8, // Smaller marker for privacy users
        fill: new Fill({ color: markerColor }),
        stroke: new Stroke({ color: 'white', width: 2 })
      })
      // Removed text property to clean up markers
    });
  }
  
  // For regular users or the current user (circle markers) - no text labels
  return new Style({
    image: new CircleStyle({
      radius: isUser ? 14 : 12,
      fill: new Fill({ color: markerColor }),
      stroke: new Stroke({ 
        color: isUser ? '#0369a1' : 'white', 
        width: isUser ? 3 : 2
      })
    })
    // Removed text property to clean up markers
  });
};
