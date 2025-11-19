/**
 * @fileoverview Toast context provider for managing toast notifications.
 * This context provides functionality to display toast notifications with different types,
 * durations, and automatic dismissal. It manages a collection of toasts and provides
 * methods to show and hide them.
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/ui/Toast";

/**
 * Interface defining the structure of a toast message.
 */
interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

/**
 * Interface defining the methods provided by the toast context.
 */
interface ToastContextType {
  showToast: (
    message: string,
    type?: "success" | "error" | "warning" | "info",
    duration?: number
  ) => void;
  hideToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Provider component that manages toast notifications state and functionality.
 * Renders a container for all active toast notifications and provides context methods.
 * @param {React.ReactNode} children - Child components that will have access to the toast context
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  /**
   * Displays a toast notification with the specified message, type, and duration.
   * Automatically removes the toast after the specified duration.
   * @param {string} message - The message to display in the toast
   * @param {string} type - The type of toast (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds before auto-dismissal
   */
  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "warning" | "info" = "error",
      duration = 3000
    ) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      // Auto dismiss after duration
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
      }
    },
    []
  );

  /**
   * Hides a toast notification by ID.
   * @param {number} id - The ID of the toast to hide
   */
  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Container for all Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isVisible={true}
            duration={toast.duration}
            onClose={() => hideToast(toast.id)}
            index={index}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Hook to access the toast context.
 * Throws an error if used outside of a ToastProvider.
 * @returns {ToastContextType} The toast context value with showToast and hideToast methods
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastProvider;
