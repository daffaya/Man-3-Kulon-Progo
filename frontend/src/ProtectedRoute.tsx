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
  requiredRole?: string;
}

/**
 * Component that protects routes by checking authentication and role permissions.
 * Validates the authentication token and redirects to login if not authenticated.
 * Redirects to "/atmin" if the user doesn't have the required role.
 * @param {React.ReactNode} children - Child components to render if authentication passes
 * @param {string} requiredRole - Optional role required to access the route
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isLoggedIn, user, token, logout, isLoadingAuth } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoadingAuth) return;

      if (isLoggedIn && token) {
        try {
          await apiFetch("/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token validation error:", error);
          logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsValidating(false);
    };

    checkAuth();
  }, [isLoggedIn, token, logout, isLoadingAuth]);

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

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/atmin" replace={true} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
