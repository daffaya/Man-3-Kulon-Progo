// backend/src/services/imageProcessingService.js
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

class ImageProcessingService {
  async createThumbnail(imagePath, outputPath) {
    await sharp(imagePath)
      .resize(300, 300, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  }

  async compressImage(imagePath) {
    // Create temporary file for output
    const tempPath = imagePath + ".temp";

    await sharp(imagePath)
      .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(tempPath);

    // Replace original file with compressed version
    await fs.rename(tempPath, imagePath);
  }

  async processImage(tempPath, albumId) {
    try {
      // Create album directory if not exists
      const albumDir = path.resolve("uploads/gallery", albumId);
      await fs.mkdir(albumDir, { recursive: true });

      // Generate filenames
      const filename = path.basename(tempPath);
      const thumbnailFilename = `thumb_${filename}`;

      // Final paths
      const finalPath = path.join(albumDir, filename);
      const thumbnailPath = path.join(albumDir, thumbnailFilename);

      // Move file from temp to album directory
      await fs.rename(tempPath, finalPath);

      // Create thumbnail
      await this.createThumbnail(finalPath, thumbnailPath);

      // Compress original (now in final location)
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
