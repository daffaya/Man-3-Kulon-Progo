/**
 * @fileoverview Custom hook for fetching and managing angkatan (batch/cohort) data.
 * This hook provides functionality to retrieve angkatan information from the API,
 * including loading states, error handling, and a refetch function.
 */

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "https://backend.man3kulonprogo.sch.id";

/**
 * Interface representing an angkatan (batch/cohort) with its count.
 */
interface Angkatan {
  angkatan: string;
  count: number;
}

/**
 * Custom hook for fetching and managing angkatan data.
 * Provides state management for angkatan list, loading status, and error handling.
 * Automatically fetches data when the token is available.
 * @returns {Object} An object containing:
 *   - angkatans: Array of angkatan objects with count information
 *   - loading: Boolean indicating if data is currently being fetched
 *   - error: Error message if the fetch failed, null otherwise
 *   - refetch: Function to manually trigger a refetch of the data
 */
export const useAngkatans = () => {
  const [angkatans, setAngkatans] = useState<Angkatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  /**
   * Fetches angkatan data from the API.
   * Uses the /students endpoint with getAngkatans=true parameter.
   * Updates state with the fetched data or error message.
   */
  const fetchAngkatans = async () => {
    if (!token) {
      setError("Token tidak tersedia");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Gunakan endpoint /students dengan parameter getAngkatans=true
      const response = await fetch(
        `${backendUrl}/api/students?getAngkatans=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch angkatans: ${response.status}`);
      }

      const data = await response.json();
      setAngkatans(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAngkatans();
    }
  }, [token]);

  return {
    angkatans,
    loading,
    error,
    refetch: fetchAngkatans,
  };
};
