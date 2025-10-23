// src/hooks/useClasses.ts
import { useState, useEffect } from "react";
import { Class } from "../types/studentTypes";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/attendance/classes`, {
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
