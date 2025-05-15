
-- This SQL migration creates an RPC function to optimize chat fetching
-- Run this in the Supabase SQL editor

-- Function to get unique conversations efficiently
CREATE OR REPLACE FUNCTION get_unique_conversations(
  user_id UUID,
  limit_per_conversation INTEGER DEFAULT 1
)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  receiver_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  read BOOLEAN,
  other_user_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_messages AS (
    SELECT 
      m.id,
      m.sender_id,
      m.receiver_id,
      m.content,
      m.created_at,
      m.read,
      CASE 
        WHEN m.sender_id = user_id THEN m.receiver_id 
        ELSE m.sender_id 
      END AS other_user_id,
      ROW_NUMBER() OVER (
        PARTITION BY 
          CASE 
            WHEN m.sender_id = user_id THEN m.receiver_id 
            ELSE m.sender_id 
          END
        ORDER BY m.created_at DESC
      ) as rn
    FROM 
      messages m
    WHERE 
      m.sender_id = user_id OR m.receiver_id = user_id
  )
  SELECT 
    rm.id,
    rm.sender_id,
    rm.receiver_id,
    rm.content,
    rm.created_at,
    rm.read,
    rm.other_user_id
  FROM 
    ranked_messages rm
  WHERE 
    rm.rn <= limit_per_conversation
  ORDER BY 
    rm.created_at DESC;
END;
$$;

-- Enable realtime for messages table to optimize subscriptions
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for profiles table to optimize status updates
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Add an index to optimize message queries
CREATE INDEX IF NOT EXISTS messages_participants_idx ON public.messages(sender_id, receiver_id);

-- Add index to profiles for location-based queries
CREATE INDEX IF NOT EXISTS profiles_is_online_idx ON public.profiles(is_online);

-- Comment with instructions for additional index
COMMENT ON TABLE public.profiles IS 'Consider adding a geography-based index if your database supports PostGIS';
