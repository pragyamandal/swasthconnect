/**
 * cloudinary.service.ts
 *
 * Wraps Cloudinary upload for prescription PDFs.
 * TRD reference: section 4.9
 *
 * Config required (from env):
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryService = {
  /**
   * Upload a PDF buffer to Cloudinary under the /prescriptions folder.
   * Returns the secure_url for storage in the consultations table.
   * Retries once on failure; returns null on second failure.
   */
  uploadPrescriptionPdf: async (_pdfBuffer: Buffer): Promise<string | null> => {
    throw new Error('cloudinaryService.uploadPrescriptionPdf — not yet implemented');
  },
};

export type CloudinaryService = typeof cloudinaryService;
