
import { supabase } from '@/integrations/supabase/client';

export const checkAndCreateProfilesBucket = async () => {
  try {
    console.log("Checking if profiles bucket exists...");
    
    // Check if the profiles bucket exists
    const { data: buckets, error } = await supabase
      .storage
      .listBuckets();
    
    if (error) {
      console.error("Error listing buckets:", error);
      throw error;
    }

    const profilesBucketExists = buckets.some(bucket => bucket.name === 'profiles');
    
    if (!profilesBucketExists) {
      console.log("Profiles bucket does not exist, attempting to create it");
      
      // Create the profiles bucket
      const { error: createError } = await supabase
        .storage
        .createBucket('profiles', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
      
      if (createError) {
        console.error("Error creating profiles bucket:", createError);
        throw createError;
      }
      
      console.log('Created profiles storage bucket');

      // Wait a moment for the bucket to be fully created
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      console.log("Profiles bucket already exists");
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up profiles bucket:', error);
    return false;
  }
};
