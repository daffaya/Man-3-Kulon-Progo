/**
 * @fileoverview Custom hook that provides a convenient interface for displaying toast notifications.
 * This hook wraps the useToast context to offer specific methods for different toast types,
 * simplifying the process of showing success, error, warning, and info messages.
 */

import { useCallback } from "react";
import { useToast } from "../contexts/ToastContext";

/**
 * Custom hook that provides typed methods for displaying toast notifications.
 * It abstracts the useToast context to offer simpler, type-specific functions
 * for showing success, error, warning, and info toasts.
 * @returns {Object} An object containing methods to show different types of toasts.
 * @returns {Function} returns.showSuccessToast - Function to show a success toast.
 * @returns {Function} returns.showErrorToast - Function to show an error toast.
 * @returns {Function} returns.showWarningToast - Function to show a warning toast.
 * @returns {Function} returns.showInfoToast - Function to show an info toast.
 */
export const useToastMessage = () => {
  const { showToast } = useToast();

  /**
   * Displays a success toast notification.
   * @param {string} message - The message to display.
   * @param {number} duration - Optional duration in milliseconds before auto-dismissal.
   */
  const showSuccessToast = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "success", duration);
    },
    [showToast]
  );

  /**
   * Displays an error toast notification.
   * @param {string} message - The message to display.
   * @param {number} duration - Optional duration in milliseconds before auto-dismissal.
   */
  const showErrorToast = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "error", duration);
    },
    [showToast]
  );

  /**
   * Displays a warning toast notification.
   * @param {string} message - The message to display.
   * @param {number} duration - Optional duration in milliseconds before auto-dismissal.
   */
  const showWarningToast = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "warning", duration);
    },
    [showToast]
  );

  /**
   * Displays an info toast notification.
   * @param {string} message - The message to display.
   * @param {number} duration - Optional duration in milliseconds before auto-dismissal.
   */
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
