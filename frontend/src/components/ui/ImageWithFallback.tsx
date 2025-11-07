// frontend/src/components/ui/ImageWithFallback.tsx
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

  const handleError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(fallback);
      onError?.();
    }
  };

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
