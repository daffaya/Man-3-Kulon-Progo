/**
 * @fileoverview Custom hook for fetching and managing class data.
 * This hook handles the state for a list of classes, including loading and error states,
 * and provides a function to refetch the data from the API.
 */

import { useState, useEffect } from "react";
import { Class } from "../types/studentTypes";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "https://backend.man3kulonprogo.sch.id";

/**
 * Custom hook to fetch and manage a list of classes from the API.
 * It provides the list of classes, loading status, any error that occurred,
 * and a function to manually trigger a refetch.
 * @returns {Object} An object containing:
 *   - {Class[]} classes - The array of fetched classes.
 *   - {boolean} loading - True if the data is currently being fetched.
 *   - {string | null} error - An error message if the fetch failed, otherwise null.
 *   - {Function} refetch - A function to manually refetch the classes.
 */
export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Asynchronously fetches the list of classes from the API.
   * Sets the loading state during the fetch, updates the classes state on success,
   * and sets the error state on failure.
   */
  const fetchClasses = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendUrl}/api/attendance/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }

      const data = await response.json();
      setClasses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return {
    classes,
    loading,
    error,
    refetch: fetchClasses,
  };
};
