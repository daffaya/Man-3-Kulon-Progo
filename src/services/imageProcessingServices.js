// backend/src/services/imageProcessingService.js
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

/**
 * @fileoverview Service for processing images, including creating thumbnails and compression.
 * This module uses the Sharp library to perform image manipulation tasks.
 */

/**
 * A service class for handling image processing operations.
 * It provides methods to create thumbnails, compress images, and orchestrate
 * the entire processing workflow for uploaded gallery images.
 */
class ImageProcessingService {
  /**
   * Creates a square thumbnail from a source image.
   * The thumbnail is resized to 300x300 pixels, using the 'cover' fit
   * to ensure the entire area is filled, and is saved as a JPEG with 80% quality.
   *
   * @param {string} imagePath - The path to the source image file.
   * @param {string} outputPath - The path where the thumbnail will be saved.
   * @returns {Promise<void>} A promise that resolves when the thumbnail has been created.
   */
  async createThumbnail(imagePath, outputPath) {
    await sharp(imagePath)
      .resize(300, 300, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  }

  /**
   * Compresses an image to reduce its file size and dimensions.
   * The image is resized to fit within a 1920x1080 pixel boundary (without enlargement)
   * and is saved as a JPEG with 85% quality, replacing the original file.
   *
   * @param {string} imagePath - The path to the image file to be compressed.
   * @returns {Promise<void>} A promise that resolves when the image has been compressed.
   */
  async compressImage(imagePath) {
    // Create a temporary file for the output to avoid corruption if the process fails.
    const tempPath = imagePath + ".temp";

    await sharp(imagePath)
      .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(tempPath);

    // Replace the original file with the compressed version.
    await fs.rename(tempPath, imagePath);
  }

  /**
   * Processes a newly uploaded image for the gallery.
   * This method handles the complete workflow: creating an album-specific directory,
   * moving the temporary file, generating a thumbnail, and compressing the original image.
   *
   * @param {string} tempPath - The temporary path of the uploaded image.
   * @param {string} albumId - The ID of the album, used to create a subdirectory.
   * @returns {Promise<object>} A promise that resolves to an object containing the paths and URLs of the processed image and its thumbnail.
   * @returns {string} returns.originalPath - The server path of the processed original image.
   * @returns {string} returns.thumbnailPath - The server path of the generated thumbnail.
   * @returns {string} returns.filename - The filename of the original image.
   * @returns {string} returns.thumbnailFilename - The filename of the thumbnail.
   * @returns {string} returns.url - The public URL of the original image.
   * @returns {string} returns.thumbnailUrl - The public URL of the thumbnail.
   */
  async processImage(tempPath, albumId) {
    try {
      // Create the album directory if it doesn't already exist.
      const albumDir = path.resolve("uploads/gallery", albumId);
      await fs.mkdir(albumDir, { recursive: true });

      // Generate filenames for the original image and its thumbnail.
      const filename = path.basename(tempPath);
      const thumbnailFilename = `thumb_${filename}`;

      // Define the final paths for the original image and thumbnail.
      const finalPath = path.join(albumDir, filename);
      const thumbnailPath = path.join(albumDir, thumbnailFilename);

      // Move the file from the temporary directory to its final album directory.
      await fs.rename(tempPath, finalPath);

      // Create a thumbnail for the image.
      await this.createThumbnail(finalPath, thumbnailPath);

      // Compress the original image in its final location.
      await this.compressImage(finalPath);

      return {
        originalPath: finalPath,
        thumbnailPath: thumbnailPath,
        filename,
        thumbnailFilename,
        url: `/uploads/gallery/${albumId}/${filename}`,
        thumbnailUrl: `/uploads/gallery/${albumId}/${thumbnailFilename}`,
      };
    } catch (error) {
      console.error("Image processing error:", error);
      throw error;
    }
  }
}

export default ImageProcessingService;
