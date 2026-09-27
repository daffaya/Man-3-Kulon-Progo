/**
 * @fileoverview ProtectedRoute component for restricting access to routes based on authentication and role.
 * This component checks if a user is authenticated and has the required role before rendering
 * its children. It validates the authentication token and redirects appropriately if the user
 * is not authenticated or lacks the required permissions.
 */

import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { apiFetch } from "./lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Allow access if the user's role is any of these. Omit to allow any authenticated role. */
  requiredRoles?: string[];
}

/**
 * Component that protects routes by checking authentication and role permissions.
 * Validates the authentication token and redirects to login if not authenticated.
 * Redirects to "/atmin" if the user's role isn't in requiredRoles.
 * @param {React.ReactNode} children - Child components to render if authentication passes
 * @param {string[]} requiredRoles - Optional list of roles allowed to access the route (any match)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { isLoggedIn, user, logout, isLoadingAuth } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoadingAuth) return;

      if (isLoggedIn) {
        try {
          // AUDIT-011: auth is cookie-based now — apiFetch sends it
          // automatically via credentials: "include", no header needed.
          await apiFetch("/users/profile");

          setIsAuthenticated(true);
        } catch (error) {
          console.error("Session validation error:", error);
          logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsValidating(false);
    };

    checkAuth();
  }, [isLoggedIn, logout, isLoadingAuth]);

  if (isLoadingAuth || isValidating) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ redirectTo: location.pathname }}
        replace={true}
      />
    );
  }

  if (
    requiredRoles &&
    requiredRoles.length > 0 &&
    !requiredRoles.includes(user?.role ?? "")
  ) {
    return <Navigate to="/atmin" replace={true} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
