// storage.js - Updated version
import { supabase } from '../supabaseClient';

const BUCKET_NAME = 'product-images';

export const initStorage = async () => {
  try {
    console.log('🔧 Initializing storage...');
    
    // Try to list buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      // Try direct access anyway
      return await testDirectBucketAccess();
    }
    
    console.log('📋 Available buckets:', buckets.map(b => ({ name: b.name, public: b.public })));
    
    const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
    
    if (bucketExists) {
      console.log('✅ Bucket "product-images" exists!');
      const bucket = buckets.find(b => b.name === BUCKET_NAME);
      console.log(`📋 Bucket details: public=${bucket.public}`);
      
      // Test if we can actually access it
      const accessible = await testDirectBucketAccess();
      if (accessible) {
        console.log('✅ Bucket is accessible!');
        return true;
      } else {
        console.warn('⚠️ Bucket exists but may not be accessible. Check policies.');
        // Return true anyway since it exists
        return true;
      }
    }
    
    console.warn('⚠️ Bucket "product-images" not found in list.');
    console.log('💡 Please create it in Supabase dashboard:');
    console.log('   Storage → Create bucket → Name: product-images → Public: ON');
    
    // Try direct access as fallback
    return await testDirectBucketAccess();
    
  } catch (error) {
    console.error('❌ Storage initialization error:', error);
    return false;
  }
};

// Test direct bucket access
export const testDirectBucketAccess = async () => {
  try {
    console.log('🧪 Testing direct bucket access...');
    
    // Try to list files (limit to 1 for speed)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 });
    
    if (error) {
      console.error('❌ Direct bucket access failed:', error);
      
      // Check if it's just empty (not an error)
      if (error.message && error.message.includes('not found')) {
        console.warn('⚠️ Bucket not found or inaccessible');
        return false;
      }
      
      // Other errors might be permission related
      console.warn('⚠️ Access error:', error.message);
      return false;
    }
    
    console.log('✅ Bucket accessible! Files:', data);
    return true;
  } catch (error) {
    console.error('❌ Bucket test error:', error);
    return false;
  }
};

export const uploadImage = async (file) => {
  try {
    console.log('📤 Uploading image:', file.name);
    
    if (!file) {
      throw new Error('No file selected');
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Please select a valid image file (JPG, PNG, WEBP, or GIF)');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    console.log(`📤 Uploading to path: ${filePath}`);

    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      
      // Provide more helpful error message
      if (uploadError.message && uploadError.message.includes('bucket not found')) {
        throw new Error(`Bucket "${BUCKET_NAME}" not found. Please create it in Supabase dashboard.`);
      } else if (uploadError.message && uploadError.message.includes('permission')) {
        throw new Error('Permission denied. Please check bucket policies in Supabase dashboard.');
      } else if (uploadError.message && uploadError.message.includes('duplicate')) {
        throw new Error('A file with this name already exists. Please try again.');
      } else {
        throw new Error('Failed to upload image: ' + uploadError.message);
      }
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log('✅ Image uploaded successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    
    if (!imageUrl.includes('supabase.co')) {
      console.log('⏭️ Skipping external image deletion:', imageUrl);
      return;
    }
    
    const urlParts = imageUrl.split('/');
    const filePath = urlParts.slice(urlParts.indexOf(BUCKET_NAME) + 1).join('/');
    
    if (filePath) {
      console.log(`🗑️ Deleting file: ${filePath}`);
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
      
      if (error) {
        console.error('❌ Error deleting image:', error);
      } else {
        console.log('✅ Image deleted successfully');
      }
    }
  } catch (error) {
    console.error('❌ Error deleting image:', error);
  }
};