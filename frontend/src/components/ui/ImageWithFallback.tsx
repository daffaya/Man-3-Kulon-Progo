import React, { useState, useEffect } from "react";

/** Props for the ImageWithFallback component. */
interface ImageWithFallbackProps {
  /** The source of the image. Can be a URL string or a File object. */
  src: string | File;
  /** The alternative text for the image. */
  alt: string;
  /** Additional CSS classes for the image element. */
  className?: string;
  /** The image source to use on load failure. */
  fallback?: string;
  /** Optional child elements to render. */
  children?: React.ReactNode;
}

/**
 * A React component that displays an image with a fallback mechanism.
 * If the image fails to load, it displays a placeholder and provides a retry option.
 * It automatically handles relative paths by prepending the backend API URL
 * and supports File objects by creating temporary blob URLs.
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = "",
  fallback = "/placeholder-image.jpg",
  children,
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(
    typeof src === "string" ? src : ""
  );
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  /**
   * Generates a full URL for a given image path.
   * @param imagePath - The relative or absolute image path.
   * @returns The full URL to the image.
   */
  const getFullImageUrl = (imagePath: string): string => {
    if (!imagePath) return fallback;

    if (imagePath.startsWith("http") || imagePath.startsWith("blob:")) {
      return imagePath;
    }

    const baseUrl =
      import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";

    return imagePath.startsWith("/")
      ? `${baseUrl}${imagePath}`
      : `${baseUrl}/${imagePath}`;
  };

  // Effect to handle File objects by creating a temporary blob URL.
  // Cleans up the URL on component unmount to prevent memory leaks.
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

  /** Handles image loading errors. */
  const handleError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(fallback);
    }
  };

  /** Allows the user to manually retry loading the image. */
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
        className={`image-error flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 ${className}`}
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
        loading="lazy"
      />
      {children}
    </>
  );
};

export default ImageWithFallback;
