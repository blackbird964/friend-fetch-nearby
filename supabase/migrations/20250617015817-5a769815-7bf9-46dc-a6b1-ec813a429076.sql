
-- Add email_notifications_enabled column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email_notifications_enabled boolean DEFAULT true;

-- Update the column to be non-null with a default value
ALTER TABLE public.profiles 
ALTER COLUMN email_notifications_enabled SET NOT NULL;

-- Create an index for better performance on email notification queries
CREATE INDEX idx_profiles_email_notifications ON public.profiles(email_notifications_enabled);
