
import { supabase } from '@/integrations/supabase/client';

export async function sendMeetupAcceptanceEmail(
  recipientEmail: string,
  senderName: string,
  duration: number,
  activity: string
): Promise<boolean> {
  try {
    const loginUrl = `${window.location.origin}/auth`;
    
    const { data, error } = await supabase.functions.invoke('send-meetup-notification', {
      body: {
        email: recipientEmail,
        senderName,
        duration,
        activity,
        loginUrl
      }
    });

    if (error) {
      console.error('Error sending meetup notification email:', error);
      return false;
    }

    console.log('Meetup notification email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending meetup notification email:', error);
    return false;
  }
}
