
import { supabase } from '@/integrations/supabase/client';

export const checkAndCreateProfilesBucket = async () => {
  try {
    // Check if the profiles bucket exists
    const { data: buckets, error } = await supabase
      .storage
      .listBuckets();
    
    if (error) {
      throw error;
    }

    const profilesBucketExists = buckets.some(bucket => bucket.name === 'profiles');
    
    if (!profilesBucketExists) {
      // Create the profiles bucket
      const { error: createError } = await supabase
        .storage
        .createBucket('profiles', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
      
      if (createError) {
        throw createError;
      }
      
      console.log('Created profiles storage bucket');

      // Set up public access policy for the bucket
      const { error: policyError } = await supabase
        .storage
        .from('profiles')
        .createSignedUrl('dummy-path', 1); // Just to trigger policy creation
      
      if (policyError && !policyError.message.includes('not found')) {
        console.error('Error setting up bucket policy:', policyError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up profiles bucket:', error);
    return false;
  }
};
