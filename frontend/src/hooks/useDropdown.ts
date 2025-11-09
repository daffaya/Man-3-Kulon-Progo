// src/hooks/useDropdown.ts
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook untuk mengelola logika dropdown.
 * - Menangani state buka/tutup.
 * - Menutup dropdown saat pengguna mengklik di luar area dropdown.
 * - Menutup dropdown saat lokasi URL berubah.
 */
export const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Tutup dropdown saat rute berubah
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = () => setIsOpen((prev) => !prev);

  return { isOpen, toggle, dropdownRef };
};
