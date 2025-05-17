
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { FriendRequest } from '@/context/types';

export const useMarkerStyles = (
  selectedUser: string | null,
  movingUsers: Set<string>,
  completedMoves: Set<string>,
  friendRequests: FriendRequest[]
) => {
  // Create marker style based on feature properties
  const getMarkerStyle = (feature: Feature<Geometry>) => {
    const userId = feature.get('userId');
    const isMoving = movingUsers.has(userId);
    const isUser = feature.get('isCurrentUser');
    const hasMoved = completedMoves.has(userId);
    const isPrivacyEnabled = feature.get('isPrivacyEnabled');
    const isCircle = feature.get('isCircle');
    const isHeatMap = feature.get('isHeatMap');
    const circleType = feature.get('circleType');
    const userName = feature.get('name') || (userId ? `User-${userId.substring(0, 4)}` : '');
    
    // Special style for heatmap marker (privacy mode)
    if (isHeatMap) {
      return new Style({
        image: new CircleStyle({
          radius: 120, // 10 times larger than normal marker (12px)
          fill: new Fill({ color: 'rgba(155, 135, 245, 0.2)' }), // Semi-transparent purple
          stroke: new Stroke({ color: 'rgba(155, 135, 245, 0.4)', width: 1 })
        }),
        zIndex: 5 // Ensure it appears below the actual marker
      });
    }
    
    // Special styles for radius or privacy circles
    if (isCircle) {
      if (circleType === 'radius') {
        return new Style({
          stroke: new Stroke({
            color: 'rgba(64, 99, 255, 0.5)',
            width: 2,
            lineDash: [5, 5]
          }),
          fill: new Fill({
            color: 'rgba(64, 99, 255, 0.05)'
          })
        });
      } else if (circleType === 'privacy') {
        // Privacy circle style is now handled in usePrivacyCircle with animation
        return new Style({
          stroke: new Stroke({
            color: 'rgba(155, 135, 245, 0.8)', // Purple color for privacy
            width: 2
          }),
          fill: new Fill({
            color: 'rgba(155, 135, 245, 0.3)' // This opacity will be animated
          }),
          text: userName ? new Text({
            text: userName,
            offsetY: -20,
            fill: new Fill({ color: '#374151' }),
            stroke: new Stroke({ color: 'white', width: 2 })
          }) : undefined
        });
      }
    }
    
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
    
    // For privacy mode users, show both text and a small marker
    if (isPrivacyEnabled && !isUser) {
      return new Style({
        image: new CircleStyle({
          radius: 8, // Smaller marker for privacy users
          fill: new Fill({ color: markerColor }),
          stroke: new Stroke({ color: 'white', width: 2 })
        }),
        text: new Text({
          text: "Someone in area online",
          offsetY: -20,
          fill: new Fill({ color: '#374151' }),
          stroke: new Stroke({ color: 'white', width: 2 })
        })
      });
    }
    
    // For regular users or the current user
    return new Style({
      image: new CircleStyle({
        radius: isUser ? 14 : 12,
        fill: new Fill({ color: markerColor }),
        stroke: new Stroke({ 
          color: isUser ? '#0369a1' : 'white', 
          width: isUser ? 3 : 2
        })
      }),
      text: new Text({
        text: userName,
        offsetY: -20,
        fill: new Fill({ color: '#374151' }),
        stroke: new Stroke({ color: 'white', width: 2 })
      })
    });
  };

  return { getMarkerStyle };
};
