
-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email text;

-- Create an index on email for better performance
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Update existing profiles with their auth email if available
-- This will help populate the email field for existing users
UPDATE public.profiles 
SET email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = profiles.id
)
WHERE email IS NULL;
