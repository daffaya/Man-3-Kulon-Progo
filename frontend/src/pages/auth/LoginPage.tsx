// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoginForm from "../../components/forms/auth/LoginForm";
import ThemeToggle from "../../components/ui/ThemeToggle";
import { User } from "../../types/userTypes";

import illustration from "/login_illustration.png";

/**
 * LoginPage component handles user authentication and redirects
 * authenticated users to the intended route.
 */
const LoginPage: React.FC = () => {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);

  // Determine redirect path after login
  const redirectTo =
    (location.state as { redirectTo?: string })?.redirectTo || "/atmin";

  // Redirect immediately if user is already logged in
  if (isLoggedIn) return <Navigate to={redirectTo} replace />;

  /**
   * Handles successful login by storing user information and token.
   * @param data - Contains user info and authentication token.
   */
  const handleLoginSuccess = (data: {
    user: { username: string; role: string };
    token: string;
  }) => {
    const user: User = {
      id: 0, // Placeholder, replace with real user ID if available
      full_name: data.user.username,
      avatar: null,
      ...data.user,
    };
    login(user, data.token);
  };

  /**
   * Handles login errors by updating the error state.
   * @param msg - Error message to display
   */
  const handleLoginError = (msg: string) => setLoginError(msg);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent items-center justify-center p-12">
        <div className="max-w-lg text-center space-y-8">
          <img
            src={illustration}
            alt="Login illustration"
            className="w-full max-w-md mx-auto drop-shadow-2xl"
          />
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              Portal Guru & Tenaga Pendidik
            </h1>
            <p className="mt-3 text-md">
              Akses semua aplikasi pendidikan dan administrasi madrasah
            </p>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background dark:bg-background">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-semibackground rounded-2xl shadow-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-center text-foreground dark:text-foreground">
              Login ke dashboard
            </h2>

            {loginError && (
              <p className="text-red-600 dark:text-red-400 text-center text-sm">
                {loginError}
              </p>
            )}

            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onLoginError={handleLoginError}
            />
          </div>

          {/* Theme toggle */}
          <div className="flex justify-end mt-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
