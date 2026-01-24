import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

// Initialize Cloudinary
let initialized = false;

function initializeCloudinary() {
  if (initialized) return;
  initialized = true;
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  logger.info('Image Upload Service Initialization (Cloudinary)');
  logger.info(`Cloud Name: ${cloudName ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  
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
    logger.warn('Image upload skipped - Cloudinary not configured');
    return { success: false, error: 'Image upload not configured' };
  }
  
  try {
    logger.debug('Uploading image to Cloudinary');
    const startTime = Date.now();
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'ssg-innovoice',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    
    const elapsed = Date.now() - startTime;
    logger.info(`Image uploaded successfully in ${elapsed}ms`, { url: result.secure_url });
    
    return { success: true, url: result.secure_url };
  } catch (error) {
    logger.error('Image upload failed', { error: error.message });
    return { success: false, error: error.message };
  }
}

export default { uploadImage };
