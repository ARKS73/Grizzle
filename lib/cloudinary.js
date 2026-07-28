import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'grizzle',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
  secure: true,
});

export async function uploadImageToCloudinary(fileString, folder = 'grizzle_products') {
  try {
    const isMock = !process.env.CLOUDINARY_CLOUD_NAME || 
                   process.env.CLOUDINARY_CLOUD_NAME === 'grizzle_cloud' ||
                   process.env.CLOUDINARY_API_KEY === '1234567890';

    if (isMock) {
      return {
        secure_url: (typeof fileString === 'string' && (fileString.startsWith('data:image') || fileString.startsWith('http')))
          ? fileString 
          : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        public_id: `mock_${Date.now()}`
      };
    }

    const uploadResponse = await cloudinary.uploader.upload(fileString, {
      folder: folder,
      transformation: [
        { width: 1000, crop: 'scale' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      secure_url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message || error);
    // Graceful fallback: return the uploaded file Data URL so the UI preview never breaks
    return {
      secure_url: (typeof fileString === 'string' && (fileString.startsWith('data:image') || fileString.startsWith('http')))
        ? fileString
        : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      public_id: `fallback_${Date.now()}`
    };
  }
}


export default cloudinary;
