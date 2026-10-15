// backend/src/services/imageProcessingService.js
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

/**
 * @fileoverview Service for processing images, including creating thumbnails and compression.
 * This module uses the Sharp library to perform image manipulation tasks.
 */

/**
 * Base uploads directory. See fileUploadService.js for why this must point
 * outside the app root on Hostinger (UPLOADS_DIR env var).
 */
const UPLOADS_BASE = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve("uploads");

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
   * Optimizes an uploaded image IN PLACE, keeping its format and filename.
   *
   * Unlike compressImage() (gallery), this does NOT force JPEG, so it is safe
   * for images where format matters (transparent PNG logos, WebP):
   * - Resizes to fit within maxDimension x maxDimension (never enlarges).
   * - Applies EXIF orientation (.rotate()) before metadata is stripped, so
   *   phone photos don't end up sideways.
   * - Re-encodes in the SAME format (jpeg/png/webp); alpha is preserved.
   * - Skips animated images (GIF / animated WebP) and unsupported formats.
   * - Never makes a file bigger: if the result isn't smaller, the original
   *   is left untouched.
   *
   * @param {string} imagePath - Path of the image file to optimize.
   * @param {object} [options]
   * @param {number} [options.maxDimension=1920] - Max width/height in px.
   * @param {number} [options.quality=80] - JPEG/WebP quality (1-100).
   * @returns {Promise<{optimized: boolean, reason?: string, before?: number, after?: number}>}
   */
  async optimizeInPlace(imagePath, { maxDimension = 1920, quality = 80 } = {}) {
    const tempPath = `${imagePath}.optimizing`;

    try {
      const image = sharp(imagePath);
      const { format, pages } = await image.metadata();

      if (pages && pages > 1) return { optimized: false, reason: "animated" };

      let pipeline = image
        .rotate()
        .resize(maxDimension, maxDimension, {
          fit: "inside",
          withoutEnlargement: true,
        });

      if (format === "jpeg") {
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      } else if (format === "png") {
        pipeline = pipeline.png({ compressionLevel: 9 });
      } else if (format === "webp") {
        pipeline = pipeline.webp({ quality });
      } else {
        return { optimized: false, reason: `unsupported format: ${format}` };
      }

      await pipeline.toFile(tempPath);

      const [original, output] = await Promise.all([
        fs.stat(imagePath),
        fs.stat(tempPath),
      ]);

      if (output.size >= original.size) {
        await fs.unlink(tempPath);
        return { optimized: false, reason: "not smaller" };
      }

      await fs.rename(tempPath, imagePath);
      return { optimized: true, before: original.size, after: output.size };
    } catch (error) {
      await fs.unlink(tempPath).catch(() => {});
      throw error;
    }
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
      const albumDir = path.join(UPLOADS_BASE, "gallery", albumId);
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
