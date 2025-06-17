
import { supabase } from '@/integrations/supabase/client';

export async function sendMeetupRequestEmail(
  recipientEmail: string,
  senderName: string,
  duration: number,
  activity: string
): Promise<boolean> {
  try {
    // Check if user has email notifications enabled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email_notifications_enabled')
      .eq('email', recipientEmail)
      .single();

    if (profileError || !profile) {
      console.log('Profile not found or error:', profileError);
      return false;
    }

    // If notifications are disabled, don't send email
    if (!profile.email_notifications_enabled) {
      console.log('Email notifications disabled for user:', recipientEmail);
      return true; // Return true so the request still goes through
    }

    const loginUrl = `${window.location.origin}/auth`;
    
    const { data, error } = await supabase.functions.invoke('send-meetup-request-notification', {
      body: {
        email: recipientEmail,
        senderName,
        duration,
        activity,
        loginUrl
      }
    });

    if (error) {
      console.error('Error sending meetup request notification email:', error);
      return false;
    }

    console.log('Meetup request notification email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending meetup request notification email:', error);
    return false;
  }
}

export async function sendMeetupAcceptanceEmail(
  recipientEmail: string,
  senderName: string,
  duration: number,
  activity: string
): Promise<boolean> {
  try {
    // Check if user has email notifications enabled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email_notifications_enabled')
      .eq('email', recipientEmail)
      .single();

    if (profileError || !profile) {
      console.log('Profile not found or error:', profileError);
      return false;
    }

    // If notifications are disabled, don't send email
    if (!profile.email_notifications_enabled) {
      console.log('Email notifications disabled for user:', recipientEmail);
      return true; // Return true so the request still goes through
    }

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
