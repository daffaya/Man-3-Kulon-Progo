import React from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white bg-red-600 dark:bg-red-700 transition-opacity duration-300"
      role="alert"
    >
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856a2 2 0 001.956-2.61l-6.928-11.547a2 2 0 00-3.464 0L4.322 17.39A2 2 0 006.276 19z"
          />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
