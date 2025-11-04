// frontend/src/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // Add optional requiredRole prop
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        state={{ redirectTo: location.pathname }}
        replace={true}
      />
    );
  }

  // Check if user has the required role
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/atmin" replace={true} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
