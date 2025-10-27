// src/hooks/useAngkatans.ts
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

interface Angkatan {
  angkatan: string;
  count: number;
}

export const useAngkatans = () => {
  const [angkatans, setAngkatans] = useState<Angkatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchAngkatans = async () => {
    if (!token) {
      setError("Token tidak tersedia");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching angkatans...");

      // Gunakan endpoint /students dengan parameter getAngkatans=true
      const response = await fetch(
        `${API_URL}/api/students?getAngkatans=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response not ok:", errorText);
        throw new Error(`Failed to fetch angkatans: ${response.status}`);
      }

      const data = await response.json();
      console.log("Angkatans data:", data);
      setAngkatans(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching angkatans:", errorMessage);
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
