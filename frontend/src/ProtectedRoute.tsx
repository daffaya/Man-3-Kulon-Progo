// frontend/src/ProtectedRoute.tsx
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

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
          // Coba validasi token dengan memanggil endpoint profile
          const response = await fetch(
            `${
              import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001"
            }/api/users/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            // Token tidak valid, logout
            logout();
            setIsAuthenticated(false);
          }
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
