
import { supabase } from '@/integrations/supabase/client';

export const checkAndCreateProfilesBucket = async () => {
  try {
    console.log("Checking if profiles bucket exists...");
    
    // Check if we can access the profiles bucket
    const { data, error } = await supabase
      .storage
      .from('profiles')
      .list('', {
        limit: 1,
      });
    
    if (error) {
      console.error("Error accessing profiles bucket:", error);
      throw error;
    }
    
    console.log("Successfully accessed profiles bucket");
    return true;
  } catch (error) {
    console.error('Error accessing profiles bucket:', error);
    return false;
  }
};

export const getProfileImageUrl = (filePath: string) => {
  if (!filePath) return null;
  
  const { data } = supabase
    .storage
    .from('profiles')
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};
