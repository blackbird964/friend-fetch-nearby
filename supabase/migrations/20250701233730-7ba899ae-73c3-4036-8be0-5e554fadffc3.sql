-- Add DELETE policy for messages table to allow users to delete messages they sent
CREATE POLICY "Users can delete messages they sent" 
ON public.messages 
FOR DELETE 
USING (auth.uid() = sender_id);