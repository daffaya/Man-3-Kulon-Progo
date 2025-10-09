import React from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  isVisible: boolean;
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = "error",
  isVisible,
  duration = 3000,
  onClose,
}) => {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

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

  const icon =
    {
      success: "M5 13l4 4L19 7", // Checkmark
      error:
        "M12 9v2m0 4h.01m-6.938 4h13.856a2 2 0 001.956-2.61l-6.928-11.547a2 2 0 00-3.464 0L4.322 17.39A2 2 0 006.276 19z",
      warning: "M12 9v2m0 4h.01m-6.938 4h13.856a2 2 0 001.956-2.61L13 13.07", // Warning triangle
      info: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    }[type] ||
    "M12 9v2m0 4h.01m-6.938 4h13.856a2 2 0 001.956-2.61l-6.928-11.547a2 2 0 00-3.464 0L4.322 17.39A2 2 0 006.276 19z";

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white ${getToastStyles()} transition-opacity duration-300`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={icon}
            />
          </svg>
          <span>{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-white hover:text-gray-200"
            aria-label="Tutup toast"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
