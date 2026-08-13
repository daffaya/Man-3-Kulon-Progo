/**
 * @fileoverview Service for processing gallery images.
 * This module provides a service class that handles the processing of uploaded image files
 * for gallery albums, using an image processing service to generate thumbnails and optimize images.
 */

import ImageProcessingService from "./imageProcessingServices.js";

/**
 * Service class for processing gallery images.
 * Handles the processing of uploaded image files for gallery albums,
 * including generating thumbnails and optimizing images.
 */
class GalleryService {
  /**
   * Creates an instance of GalleryService.
   * Initializes the image processing service.
   */
  constructor() {
    this.imageProcessor = new ImageProcessingService();
  }

  /**
   * Processes uploaded image files for a specific album.
   * Processes files in parallel using the image processing service.
   *
   * @param {Array<object>} files - Array of uploaded file objects.
   * @param {string} files[].path - The file path on the server.
   * @param {string} files[].originalname - The original filename.
   * @param {string} files[].filename - The generated filename.
   * @param {string} albumId - The ID of the album to associate the images with.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of processed file objects.
   * @returns {string} returns[].filename - The filename of the processed image.
   * @returns {string} returns[].url - The URL to access the processed image.
   * @returns {string} returns[].thumbnailUrl - The URL to access the thumbnail of the image.
   */
  async processUploadedFiles(files, albumId) {
    const processedFiles = [];

    const processingPromises = files.map((file) =>
      this.imageProcessor.processImage(file.path, albumId).catch((error) => {
        console.error(`Failed to process ${file.originalname}:`, error);
        return {
          filename: file.filename,
          url: `/uploads/gallery/${albumId}/${file.filename}`,
          thumbnailUrl: `/uploads/gallery/${albumId}/${file.filename}`,
          error: true,
        };
      })
    );

    const results = await Promise.all(processingPromises);

    return results.filter((result) => !result.error);
  }
}

export default GalleryService;
