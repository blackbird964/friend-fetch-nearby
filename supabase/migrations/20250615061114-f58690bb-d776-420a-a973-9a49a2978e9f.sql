
-- Create a friendships table to track when users became friends
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'removed')),
  
  -- Ensure no duplicate friendships (both directions)
  UNIQUE(user_id, friend_id),
  -- Ensure users can't be friends with themselves
  CHECK (user_id != friend_id)
);

-- Add Row Level Security
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships they're part of
CREATE POLICY "Users can view their friendships" 
  ON public.friendships 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friendships where they are one of the participants
CREATE POLICY "Users can create friendships" 
  ON public.friendships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can update friendships they're part of
CREATE POLICY "Users can update their friendships" 
  ON public.friendships 
  FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Add trigger for updated_at
CREATE TRIGGER update_friendships_updated_at 
  BEFORE UPDATE ON public.friendships 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance
CREATE INDEX idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON public.friendships(friend_id);
