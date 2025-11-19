/**
 * @fileoverview React component for a gallery image upload interface.
 * This component provides a drag-and-drop area and a file input for selecting multiple images.
 * It includes file validation for type and size, displays a preview of selected images,
 * and allows users to remove individual images before uploading.
 */

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

/**
 * Props for the GalleryUpload component.
 * @typedef {object} GalleryUploadProps
 * @property {(files: File[]) => void} onUpload - Callback function triggered when the upload button is clicked.
 * @property {boolean} [loading=false] - Flag to indicate if an upload is in progress.
 * @property {number} [maxFiles=10] - Maximum number of files allowed for selection.
 * @property {string} [acceptedTypes="image/*"] - The accepted file types for the input.
 * @property {number} [maxSize=10] - Maximum file size in megabytes.
 */
interface GalleryUploadProps {
  onUpload: (files: File[]) => void;
  loading?: boolean;
  maxFiles?: number;
  acceptedTypes?: string;
  maxSize?: number; // in MB
}
/**
 * A React component for uploading images to a gallery.
 * Features a drag-and-drop zone, file validation, preview of selected images,
 * and the ability to remove images before the final upload.
 *
 * @param {GalleryUploadProps} props - The props for the component.
 * @returns {JSX.Element} The rendered gallery upload component.
 */
const GalleryUpload: React.FC<GalleryUploadProps> = ({
  onUpload,
  loading = false,
  maxFiles = 10,
  acceptedTypes = "image/*",
  maxSize = 10,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles drag events to update the visual state of the drop zone.
   * @param {React.DragEvent} e - The drag event.
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  /**
   * Handles the drop event to process dropped files.
   * @param {React.DragEvent} e - The drop event.
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  /**
   * Handles the change event from the file input.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  /**
   * Validates a list of files and updates the state with valid selections.
   * @param {FileList} files - The list of files to validate.
   */
  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files);
    const newErrors: string[] = [];

    if (selectedFiles.length + newFiles.length > maxFiles) {
      newErrors.push(`Maksimal ${maxFiles} foto`);
    }

    const validFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        newErrors.push(`${file.name} bukan file gambar`);
        return false;
      }

      if (file.size > maxSize * 1024 * 1024) {
        newErrors.push(`${file.name} terlalu besar (max ${maxSize}MB)`);
        return false;
      }

      return true;
    });

    setErrors(newErrors);
    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, maxFiles));
  };

  /**
   * Removes a file from the list of selected files by its index.
   * @param {number} index - The index of the file to remove.
   */
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Calls the onUpload callback with the selected files and resets the component state.
   */
  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
      setErrors([]);
    }
  };

  /**
   * Programmatically opens the file selection dialog.
   */
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent)),0.05]"
            : "border-[rgb(var(--color-secondary-button))] hover:border-[rgb(var(--color-secondary-hover))]"
        } ${loading ? "pointer-events-none opacity-50" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="hidden"
          disabled={loading}
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-[rgb(var(--color-secondary))]" />
          </div>

          <div>
            <p className="text-lg font-medium text-foreground">
              Drag & drop foto di sini
            </p>
            <p className="text-sm text-secondary mt-1">
              atau klik untuk memilih file
            </p>
          </div>

          <div className="text-xs text-secondary">
            <p>Maksimal {maxFiles} foto</p>
            <p>Ukuran maksimal {maxSize}MB per foto</p>
            <p>Format: JPG, PNG, GIF, WebP</p>
          </div>

          <button
            type="button"
            onClick={openFileDialog}
            disabled={loading}
            className="btn btn-primary"
          >
            Pilih Foto
          </button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-[rgb(var(--color-error)),0.1] border border-[rgb(var(--color-error))] rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-[rgb(var(--color-error))] mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-[rgb(var(--color-error))]">
                Error Upload
              </h3>
              <div className="mt-2 text-sm text-[rgb(var(--color-error))]">
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground">
              Foto Terpilih ({selectedFiles.length})
            </h3>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-sm text-[rgb(var(--color-error))] hover:opacity-80"
            >
              Hapus Semua
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-[rgb(var(--color-semi-background))]">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-[rgb(var(--color-error))] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Hapus foto"
                >
                  <X size={16} />
                </button>

                <div className="mt-2">
                  <p className="text-xs text-secondary truncate">{file.name}</p>
                  <p className="text-xs text-secondary">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={loading || selectedFiles.length === 0}
              className="btn btn-primary flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Upload {selectedFiles.length} Foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryUpload;
