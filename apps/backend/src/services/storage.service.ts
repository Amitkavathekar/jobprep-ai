import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export class StorageService {
  public static async uploadFile(
    fileBuffer: Buffer,
    folderName: string = 'jobprep'
  ): Promise<string> {
    if (!env.CLOUDINARY_CLOUD_NAME) {
      logger.warn('Cloudinary credentials missing. Returning local mock URL.');
      return `https://storage.mock.jobprep.ai/${folderName}/${Date.now()}.pdf`;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName, resource_type: 'auto' },
        (error: any, result: any) => {
          if (error || !result) {
            logger.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve(result.secure_url);
        }
      );
      uploadStream.end(fileBuffer);
    });
  }
}
