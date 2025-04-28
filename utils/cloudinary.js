import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary
export const uploadToCloudinary = async (file) => {
  try {
    if (!file || !file.buffer) {
      throw new Error('No file provided');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER_NAME,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            console.error('Upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Create a readable stream from the buffer and pipe it to the upload stream
      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw new Error('Error uploading image');
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (url) => {
  try {
    if (!url) {
      throw new Error('No URL provided');
    }

    // Extract public_id from URL
    const parts = url.split('/');
    const filenameWithExtension = parts[parts.length - 1];
    const publicId = filenameWithExtension.split('.')[0];

    // Destroy the image using the public_id
    return await cloudinary.uploader.destroy(`${process.env.CLOUDINARY_FOLDER_NAME}/${publicId}`);
  } catch (error) {
    console.error('Error in deleteFromCloudinary:', error);
    throw new Error('Error deleting image');
  }
};
