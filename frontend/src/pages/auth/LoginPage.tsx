import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoginForm from "../../components/auth/LoginForm";
import ThemeToggle from "../../components/ui/ThemeToggle";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLoginSuccess = (data: {
    user: { username: string; role: string };
    token: string;
  }) => {
    setLoginError(null);
    login(data.user, data.token);
    navigate("/atmin");
  };

  const handleLoginError = (message: string) => {
    setLoginError(message);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="bg-white dark:bg-semibackground p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Login to Admin
        </h2>
        {loginError && (
          <p className="text-red-500 text-sm mb-4">{loginError}</p>
        )}
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onLoginError={handleLoginError}
        />
      </div>
    </div>
  );
};

export default LoginPage;
