import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import RegisterForm from "../../components/forms/auth/RegisterForm";
import ThemeToggle from "../../components/ui/ThemeToggle";

const RegisterPage: React.FC = () => {
  const { isLoggedIn, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isLoggedIn) {
      navigate("/atmin");
    }
  }, [isLoggedIn, navigate]);

  const handleRegister = async (userData: {
    username: string;
    password: string;
    role: string;
  }) => {
    setIsLoading(true);
    setRegisterError(null);

    try {
      const result = await registerUser(userData);

      if (result.success) {
        // Redirect to login page after successful registration
        navigate("/login");
      } else {
        setRegisterError(result.message || "Registration failed");
      }
    } catch (error: any) {
      setRegisterError("Terjadi kesalahan saat menghubungi server.");
      console.error("Error during registration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="bg-white dark:bg-semibackground p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Register a User
        </h2>
        {registerError && (
          <p className="text-red-500 text-sm mb-4">{registerError}</p>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : (
          <RegisterForm onSubmit={handleRegister} />
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
