import React, { useEffect, useRef } from "react";
import { X } from "lucide-react"; // Ganti SVG manual dengan ikon X dari lucide-react

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  isVisible: boolean;
  duration?: number;
  onClose?: () => void;
  index?: number; // Untuk stackable offset
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = "error",
  isVisible,
  duration = 2000,
  onClose,
  index = 0, // Default index 0 untuk offset
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isVisible && duration > 0) {
      timerRef.current = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timerRef.current!);
    }
  }, [isVisible, duration, onClose]);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    if (isVisible && duration > 0) {
      timerRef.current = setTimeout(() => {
        onClose?.();
      }, duration);
    }
  };

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-600 dark:bg-green-700";
      case "warning":
        return "bg-yellow-600 dark:bg-yellow-700";
      case "info":
        return "bg-blue-600 dark:bg-blue-700";
      default:
        return "bg-red-600 dark:bg-red-700";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856a2 2 0 001.956-2.61L13 13.07"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856a2 2 0 001.956-2.61l-6.928-11.547a2 2 0 00-3.464 0L4.322 17.39A2 2 0 006.276 19z"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`fixed right-4 z-50 p-4 rounded-xl shadow-2xl text-white ${getToastStyles()} transition-all duration-300 transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
      style={{ bottom: `${4 + index * 5}rem` }} // Offset untuk stack
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getIcon()}
          <span className="text-sm font-medium">{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200 transition-colors"
            aria-label="Tutup toast"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
