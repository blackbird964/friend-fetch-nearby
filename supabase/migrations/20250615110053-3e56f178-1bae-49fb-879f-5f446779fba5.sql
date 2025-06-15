
-- Create upcoming_sessions table to track scheduled meetups
CREATE TABLE public.upcoming_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_name TEXT NOT NULL,
  friend_profile_pic TEXT,
  activity TEXT NOT NULL,
  duration INTEGER NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.upcoming_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions" 
  ON public.upcoming_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create their own sessions" 
  ON public.upcoming_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions" 
  ON public.upcoming_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_upcoming_sessions_updated_at 
  BEFORE UPDATE ON public.upcoming_sessions 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add total_catchup_time column to profiles table to track user's total time
ALTER TABLE public.profiles 
ADD COLUMN total_catchup_time INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX idx_upcoming_sessions_user_id ON public.upcoming_sessions(user_id);
CREATE INDEX idx_upcoming_sessions_status ON public.upcoming_sessions(status);
