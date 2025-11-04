// contexts/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/ui/Toast";

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: "success" | "error" | "warning" | "info",
    duration?: number
  ) => void;
  hideToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "warning" | "info" = "error",
      duration = 3000
    ) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      // Hapus otomatis setelah duration
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
      }
    },
    []
  );

  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Container untuk semua Toast */}
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

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastProvider;
