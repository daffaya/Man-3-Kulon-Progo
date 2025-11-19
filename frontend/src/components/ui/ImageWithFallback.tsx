/**
 * @fileoverview ImageWithFallback component for displaying images with fallback handling.
 * This component renders an image with automatic fallback to a default image if the primary
 * image fails to load. It supports both string URLs and File objects as image sources,
 * and provides a retry mechanism when images fail to load.
 */

import React, { useState, useEffect } from "react";

interface ImageWithFallbackProps {
  src: string | File;
  alt: string;
  className?: string;
  fallback?: string;
  children?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Component that displays an image with fallback functionality.
 * Handles both string URLs and File objects as image sources, and provides
 * a fallback image when the primary image fails to load. Includes a retry
 * mechanism for failed images.
 * @param {string | File} src - The image source, either a URL string or a File object.
 * @param {string} alt - Alternative text for the image for accessibility.
 * @param {string} className - Additional CSS classes to apply to the image.
 * @param {string} fallback - URL of the fallback image to use when the primary image fails.
 * @param {React.ReactNode} children - Optional child elements to render alongside the image.
 * @param {Function} onLoad - Callback function triggered when the image loads successfully.
 * @param {Function} onError - Callback function triggered when the image fails to load.
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = "",
  fallback = "/placeholder-image.jpg",
  children,
  onLoad,
  onError,
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(
    typeof src === "string" ? src : ""
  );
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  /**
   * Converts an image path to a full URL if it's not already a complete URL.
   * @param {string} imagePath - The image path to convert.
   * @returns {string} The full URL of the image.
   */
  const getFullImageUrl = (imagePath: string): string => {
    if (!imagePath) return fallback;
    if (imagePath.startsWith("http") || imagePath.startsWith("blob:")) {
      return imagePath;
    }
    const baseUrl =
      import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";
    const normalizedPath = imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;
    return `${baseUrl}${normalizedPath}`;
  };

  useEffect(() => {
    if (typeof src === "object" && src instanceof File) {
      const url = URL.createObjectURL(src);
      setObjectUrl(url);
      setImgSrc(url);
      return () => {
        URL.revokeObjectURL(url);
        setObjectUrl(null);
      };
    } else {
      setImgSrc(getFullImageUrl(src as string));
    }
  }, [src]);

  /**
   * Handles image loading errors by setting the error state and loading the fallback image.
   */
  const handleError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(fallback);
      onError?.();
    }
  };

  /**
   * Attempts to reload the image by resetting the error state and updating the image source.
   */
  const handleReload = () => {
    setImgError(false);
    if (src instanceof File) {
      const url = URL.createObjectURL(src);
      setObjectUrl(url);
      setImgSrc(url);
    } else {
      setImgSrc(getFullImageUrl(src as string));
    }
  };

  if (imgError) {
    return (
      <div
        className={`image-error flex items-center justify-center bg-[rgb(var(--color-semi-background))] text-[rgb(var(--color-secondary))] ${className}`}
        style={{
          width: "100%",
          height: "100%",
          fontSize: "0.75rem",
          borderRadius: "0.375rem",
          cursor: "pointer",
        }}
        title="Image failed to load — click to retry"
        onClick={handleReload}
      >
        🖼️
      </div>
    );
  }

  return (
    <>
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={onLoad}
        loading="lazy"
      />
      {children}
    </>
  );
};

export default ImageWithFallback;
