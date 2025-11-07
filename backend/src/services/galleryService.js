// backend/src/services/galleryService.js
import ImageProcessingService from "./imageProcessingServices.js";

class GalleryService {
  constructor() {
    this.imageProcessor = new ImageProcessingService();
  }

  async processUploadedFiles(files, albumId) {
    const processedFiles = [];

    // Process files in parallel
    const processingPromises = files.map((file) =>
      this.imageProcessor.processImage(file.path, albumId).catch((error) => {
        console.error(`Failed to process ${file.originalname}:`, error);
        // Return basic info if processing fails
        return {
          filename: file.filename,
          url: `/uploads/gallery/${albumId}/${file.filename}`,
          thumbnailUrl: `/uploads/gallery/${albumId}/${file.filename}`,
          error: true,
        };
      })
    );

    const results = await Promise.all(processingPromises);

    // Filter out failed processing if needed
    return results.filter((result) => !result.error);
  }
}

export default GalleryService;
