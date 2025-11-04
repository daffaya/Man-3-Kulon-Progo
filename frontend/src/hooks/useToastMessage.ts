// hooks/useToastMessage.ts
import { useCallback } from "react";
import { useToast } from "../contexts/ToastContext";

export const useToastMessage = () => {
  const { showToast } = useToast();

  const showSuccessToast = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "success", duration);
    },
    [showToast]
  );

  const showErrorToast = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "error", duration);
    },
    [showToast]
  );

  const showWarningToast = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "warning", duration);
    },
    [showToast]
  );

  const showInfoToast = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "info", duration);
    },
    [showToast]
  );

  return {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
  };
};
