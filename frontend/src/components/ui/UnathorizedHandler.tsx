/**
 * @fileoverview UnauthorizedHandler component for global unauthorized event management.
 * This is a non-visual component that listens for a custom 'unauthorized' event on the window object.
 * When the event is triggered, it logs the user out and redirects them to the login page.
 * This provides a centralized way to handle authentication failures across the application.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Component that handles global unauthorized events.
 * It sets up an event listener on the window object. When a custom 'unauthorized'
 * event is dispatched, it logs out the current user and navigates them to the login page.
 * This component does not render any UI.
 */
const UnauthorizedHandler = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    /**
     * Handles the unauthorized event by logging out and redirecting.
     */
    const handleUnauthorized = () => {
      logout();
      navigate("/login");
    };

    window.addEventListener("unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [logout, navigate]);

  return null;
};

export default UnauthorizedHandler;
