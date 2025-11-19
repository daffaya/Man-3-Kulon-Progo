/**
 * @fileoverview Custom hook for managing dropdown state and behavior.
 * This hook provides functionality to toggle a dropdown's open/closed state,
 * automatically close it when clicking outside, and close it upon route changes.
 */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook to manage the logic of a dropdown component.
 * Handles the open/closed state, closes the dropdown when the user clicks outside,
 * and closes it when the URL location changes.
 * @returns {Object} An object containing the dropdown state and control functions.
 * @returns {boolean} returns.isOpen - Whether the dropdown is currently open.
 * @returns {Function} returns.toggle - Function to toggle the dropdown's open state.
 * @returns {React.RefObject<HTMLDivElement>} returns.dropdownRef - Ref to be attached to the dropdown container element.
 */
export const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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
