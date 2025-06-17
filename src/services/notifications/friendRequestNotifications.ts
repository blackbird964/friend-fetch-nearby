
import { supabase } from '@/integrations/supabase/client';

export async function sendFriendRequestEmail(
  recipientEmail: string,
  senderName: string,
  senderProfilePic?: string | null
): Promise<boolean> {
  try {
    const loginUrl = `${window.location.origin}/auth`;
    
    const { data, error } = await supabase.functions.invoke('send-friend-request-notification', {
      body: {
        email: recipientEmail,
        senderName,
        senderProfilePic,
        loginUrl
      }
    });

    if (error) {
      console.error('Error sending friend request notification email:', error);
      return false;
    }

    console.log('Friend request notification email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending friend request notification email:', error);
    return false;
  }
}

export async function sendFriendRequestAcceptanceEmail(
  recipientEmail: string,
  accepterName: string
): Promise<boolean> {
  try {
    const loginUrl = `${window.location.origin}/auth`;
    
    const { data, error } = await supabase.functions.invoke('send-friend-request-acceptance-notification', {
      body: {
        email: recipientEmail,
        accepterName,
        loginUrl
      }
    });

    if (error) {
      console.error('Error sending friend request acceptance notification email:', error);
      return false;
    }

    console.log('Friend request acceptance notification email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending friend request acceptance notification email:', error);
    return false;
  }
}
