import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary
let initialized = false;

function initializeCloudinary() {
  if (initialized) return;
  initialized = true;
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📷 IMAGE UPLOAD SERVICE INITIALIZATION (Cloudinary)');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Cloud Name: ${cloudName ? `${cloudName} (CONFIGURED ✅)` : 'NOT CONFIGURED ❌'}`);
  console.log('═══════════════════════════════════════════════════════');
  
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });
  }
}

/**
 * Upload image to Cloudinary
 * @param {string} base64Image - Base64 encoded image string
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadImage(base64Image) {
  initializeCloudinary();
  
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('⚠️  Image upload skipped - Cloudinary not configured');
    return { success: false, error: 'Image upload not configured' };
  }
  
  try {
    console.log('📤 Uploading image to Cloudinary...');
    const startTime = Date.now();
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'ssg-innovoice',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Max dimensions
        { quality: 'auto:good' }, // Auto optimize quality
        { fetch_format: 'auto' } // Auto format (webp if supported)
      ]
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ Image uploaded successfully (${elapsed}ms)`);
    console.log(`   URL: ${result.secure_url}`);
    
    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error('❌ Image upload failed:', error.message);
    return { success: false, error: error.message };
  }
}

export default { uploadImage };
