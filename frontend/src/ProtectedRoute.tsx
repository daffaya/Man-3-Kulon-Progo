import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login"); // Arahkan ke login jika tidak login
    }
  }, [isLoggedIn, navigate]);

  // Jika sudah login, render children
  return isLoggedIn ? <>{children}</> : null;
};

export default ProtectedRoute;
