import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import { useToastMessage } from "../../hooks/useToastMessage";

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (file?: File, url?: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage = "",
  onImageChange,
  disabled = false,
  label = "Gambar",
  required = false,
}) => {
  const { showSuccessToast, showErrorToast, showInfoToast } = useToastMessage();
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [urlError, setUrlError] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 15 * 1024 * 1024;

  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
    } else {
      setPreviewUrl("");
    }
  }, [currentImage]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (activeTab === "upload") {
      setImageUrl("");
      setUrlError("");
    }
  }, [activeTab]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
          showErrorToast("Hanya file gambar yang diperbolehkan");
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          showErrorToast(`Ukuran file maksimal 15MB`);
          return;
        }
        if (previewUrl) {
          setPendingFile(file);
          setShowConfirmDialog(true);
        } else {
          processFileUpload(file);
        }
      }
    },
    [previewUrl, showErrorToast]
  );

  const processFileUpload = useCallback(
    (file: File) => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      onImageChange(file);
      setImageUrl("");
      setUrlError("");
      showSuccessToast("Gambar berhasil diunggah");
    },
    [previewUrl, onImageChange, showSuccessToast]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (!file.type.startsWith("image/")) {
          showErrorToast("Hanya file gambar yang diperbolehkan");
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          showErrorToast(`Ukuran file maksimal 15MB`);
          return;
        }
        if (previewUrl) {
          setPendingFile(file);
          setShowConfirmDialog(true);
        } else {
          processFileUpload(file);
        }
      }
    },
    [previewUrl, processFileUpload, showErrorToast]
  );

  const handleImageUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setImageUrl(e.target.value);
      setUrlError("");
    },
    []
  );

  const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
        setTimeout(() => resolve(false), 5000);
      });
    } catch (error) {
      console.error("Error validating image URL:", error);
      return false;
    }
  };

  const handleFetchImageFromUrl = useCallback(async () => {
    setUrlError("");
    if (!imageUrl.trim()) {
      setUrlError("URL tidak boleh kosong");
      showErrorToast("URL tidak boleh kosong");
      return;
    }

    try {
      setIsLoadingUrl(true);
      new URL(imageUrl);

      const isValidImage = await validateImageUrl(imageUrl);
      if (!isValidImage) {
        setUrlError(
          "URL tidak mengarah ke gambar yang valid atau tidak dapat diakses"
        );
        showErrorToast("URL tidak mengarah ke gambar yang valid");
        return;
      }

      if (previewUrl) {
        setPendingImageUrl(imageUrl);
        setShowConfirmDialog(true);
      } else {
        processImageUrl(imageUrl);
      }
    } catch (error) {
      console.error("URL validation error:", error);
      setUrlError(
        "URL tidak valid. Pastikan dimulai dengan http:// atau https://"
      );
      showErrorToast("URL tidak valid");
    } finally {
      setIsLoadingUrl(false);
    }
  }, [imageUrl, previewUrl, showErrorToast]);

  const processImageUrl = useCallback(
    (url: string) => {
      setPreviewUrl(url);
      setSelectedFile(null);
      onImageChange(undefined, url);
      setImageUrl("");
      setUrlError("");
      showSuccessToast("Gambar berhasil dimuat dari URL");
    },
    [onImageChange, showSuccessToast]
  );

  const handleRemoveImage = useCallback(() => {
    setPreviewUrl("");
    setSelectedFile(null);
    setImageUrl("");
    setUrlError("");
    onImageChange();
    if (fileInputRef.current) fileInputRef.current.value = "";
    showInfoToast("Gambar dihapus");
  }, [onImageChange, showInfoToast]);

  const handleUploadClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleConfirmReplace = useCallback(() => {
    if (pendingFile) {
      processFileUpload(pendingFile);
      setPendingFile(null);
    } else if (pendingImageUrl) {
      processImageUrl(pendingImageUrl);
      setPendingImageUrl("");
    }
    setShowConfirmDialog(false);
  }, [pendingFile, pendingImageUrl, processFileUpload, processImageUrl]);

  const handleCancelReplace = useCallback(() => {
    setPendingFile(null);
    setPendingImageUrl("");
    setShowConfirmDialog(false);
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-foreground">
        {label}{" "}
        {required && <span className="text-[rgb(var(--color-error))]">*</span>}
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        disabled={disabled}
      />

      {/* Tabs for Desktop */}
      <div className="hidden sm:flex border-b border-zinc-800 mb-4">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "upload"}
          aria-controls="upload-panel"
          tabIndex={activeTab === "upload" ? 0 : -1}
          className={`py-2 px-4 font-medium text-sm rounded-t-lg transition-all duration-200 ${
            activeTab === "upload"
              ? "text-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent),0.1)] border-b-2 border-[rgb(var(--color-accent))]"
              : "text-secondary hover:text-foreground hover:bg-[rgb(var(--color-secondary-hover))]"
          }`}
          onClick={() => setActiveTab("upload")}
          disabled={disabled}
        >
          Upload Gambar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "url"}
          aria-controls="url-panel"
          tabIndex={activeTab === "url" ? 0 : -1}
          className={`py-2 px-4 font-medium text-sm rounded-t-lg transition-all duration-200 ${
            activeTab === "url"
              ? "text-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent),0.1)] border-b-2 border-[rgb(var(--color-accent))]"
              : "text-secondary hover:text-foreground hover:bg-[rgb(var(--color-secondary-hover))]"
          }`}
          onClick={() => setActiveTab("url")}
          disabled={disabled}
        >
          URL
        </button>
      </div>

      {/* Segmented Control for Mobile */}
      <div className="sm:hidden mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "upload"}
            aria-controls="upload-panel"
            tabIndex={activeTab === "upload" ? 0 : -1}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-all duration-200 ${
              activeTab === "upload"
                ? "bg-[rgb(var(--color-accent))] text-white"
                : "bg-[rgb(var(--color-secondary-button))] text-secondary hover:bg-[rgb(var(--color-secondary-hover))]"
            }`}
            onClick={() => setActiveTab("upload")}
            disabled={disabled}
          >
            Upload Gambar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "url"}
            aria-controls="url-panel"
            tabIndex={activeTab === "url" ? 0 : -1}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-all duration-200 ${
              activeTab === "url"
                ? "bg-[rgb(var(--color-accent))] text-white"
                : "bg-[rgb(var(--color-secondary-button))] text-secondary hover:bg-[rgb(var(--color-secondary-hover))]"
            }`}
            onClick={() => setActiveTab("url")}
            disabled={disabled}
          >
            URL
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mb-4 text-xs text-secondary flex items-center gap-1">
        <span>Format: JPG, PNG, GIF, WebP • Maks: 15MB</span>
        <div className="relative group">
          <HelpCircle
            size={14}
            className="text-[rgb(var(--color-secondary))] cursor-help"
          />
          <div className="absolute hidden group-hover:block bg-[rgb(var(--color-foreground))] text-white text-xs rounded p-2 -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
            Drag & drop atau klik untuk upload
          </div>
        </div>
      </div>

      {/* Tab Content Container with Transition */}
      <div className="relative">
        {/* Upload Tab Content */}
        <div
          id="upload-panel"
          role="tabpanel"
          aria-labelledby="upload-tab"
          className={`transition-all duration-300 ease-in-out transform ${
            activeTab === "upload"
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-full absolute inset-0 pointer-events-none"
          }`}
        >
          <div
            className={`mt-2 w-full aspect-[16/9] max-h-64 rounded-md border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent),0.1)] scale-[1.02]"
                : previewUrl
                ? "border-none p-0"
                : "border-dashed border-[rgb(var(--color-secondary-button))] bg-[rgb(var(--color-semi-background))] hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!previewUrl ? handleUploadClick : undefined}
          >
            {previewUrl ? (
              <div
                className="relative group w-full h-full rounded-md overflow-hidden"
                onClick={!disabled ? handleUploadClick : undefined}
              >
                <ImageWithFallback
                  src={previewUrl}
                  alt="Pratinjau gambar"
                  className="w-full h-full object-cover"
                  fallback="/placeholder-image.jpg"
                />
                {!disabled && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center transition-all duration-200 rounded-md p-2 opacity-0 group-hover:opacity-100">
                    <div className="flex flex-col items-center justify-center text-center">
                      <p className="text-white text-sm font-medium mb-1">
                        Klik untuk ganti
                      </p>
                      <p className="text-white text-xs bg-black bg-opacity-70 rounded p-1 max-w-xs break-all">
                        {selectedFile ? selectedFile.name : "Gambar dari URL"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <ImageIcon
                  size={32}
                  className="text-[rgb(var(--color-secondary))] mb-2"
                />
                <p className="text-sm text-secondary">
                  {isDragging ? "Lepaskan di sini" : "Belum ada gambar"}
                </p>
                <p className="text-xs text-[rgb(var(--color-secondary))] mt-1">
                  Klik atau drag gambar
                </p>
              </>
            )}
          </div>

          <div className="mt-3 flex justify-end space-x-2">
            {!previewUrl ? (
              <button
                type="button"
                onClick={handleUploadClick}
                className="btn btn-secondary flex items-center transition-transform duration-150 hover:scale-105 active:scale-95"
                disabled={disabled}
              >
                <Upload size={16} className="mr-2" />
                Upload Gambar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUploadClick}
                className="btn btn-outline flex items-center transition-transform duration-150 hover:scale-105 active:scale-95"
                disabled={disabled}
              >
                <Upload size={16} className="mr-2" />
                Ganti Gambar
              </button>
            )}
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="btn btn-danger flex items-center transition-transform duration-150 hover:scale-105 active:scale-95"
                disabled={disabled}
              >
                <X size={16} className="mr-2" />
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* URL Tab Content */}
        <div
          id="url-panel"
          role="tabpanel"
          aria-labelledby="url-tab"
          className={`transition-all duration-300 ease-in-out transform ${
            activeTab === "url"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-full absolute inset-0 pointer-events-none"
          }`}
        >
          <div className="flex items-start mb-3">
            <input
              type="text"
              value={imageUrl}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/image.jpg"
              className={`form-input rounded-r-none flex-grow ${
                urlError
                  ? "border-[rgb(var(--color-error))] focus:ring-[rgb(var(--color-error)),0.5]"
                  : ""
              }`}
              disabled={disabled}
              aria-describedby={urlError ? "url-error" : undefined}
            />
            <button
              type="button"
              onClick={handleFetchImageFromUrl}
              className="btn btn-secondary rounded-l-none flex items-center transition-transform duration-150 hover:scale-105 active:scale-95"
              disabled={disabled || !imageUrl.trim() || isLoadingUrl}
            >
              {isLoadingUrl ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memuat...
                </>
              ) : (
                "Ambil"
              )}
            </button>
          </div>
          {urlError && (
            <p
              id="url-error"
              className="text-xs text-[rgb(var(--color-error))] mb-2 -mt-2 flex items-center"
            >
              <AlertTriangle size={12} className="mr-1 flex-shrink-0" />
              {urlError}
            </p>
          )}

          {!previewUrl && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleFetchImageFromUrl}
                className="btn btn-primary flex items-center transition-transform duration-150 hover:scale-105 active:scale-95"
                disabled={disabled || !imageUrl.trim() || isLoadingUrl}
              >
                <ImageIcon size={16} className="mr-2" />
                Gunakan URL Ini
              </button>
            </div>
          )}

          {previewUrl && (
            <div className="mt-3">
              <p className="text-sm font-medium text-foreground mb-2">
                Pratinjau:
              </p>
              <div className="mt-2 w-full aspect-[16/9] max-h-64 rounded-md border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200">
                <div className="relative group w-full h-full rounded-md overflow-hidden">
                  <ImageWithFallback
                    src={previewUrl}
                    alt="Pratinjau gambar"
                    className="w-full h-full object-cover"
                    fallback="/placeholder-image.jpg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <p className="text-white text-xs p-2 bg-black bg-opacity-70 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center max-w-xs mx-2 truncate">
                      {previewUrl}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="btn btn-danger flex items-center transition-transform duration-150 hover:scale-105 active:scale-95"
                  disabled={disabled}
                >
                  <X size={16} className="mr-2" />
                  Hapus
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-all duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
        >
          <div className="card max-w-md w-full p-6 transform transition-all duration-300 scale-100 opacity-100">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-[rgb(var(--color-warning))]" />
              </div>
              <div className="ml-3">
                <h3
                  id="dialog-title"
                  className="text-lg font-medium text-foreground"
                >
                  Ganti Gambar?
                </h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-secondary">
                Gambar saat ini akan diganti. Lanjutkan?
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelReplace}
                className="btn btn-outline"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReplace}
                className="btn btn-primary"
              >
                Ganti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
