import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: (userData: {
    user: { username: string; role: string };
    token: string;
  }) => void;
  onLoginError: (message: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const BACKEND_API_URL =
      import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess({
          user: data.user,
          token: data.token,
        });
        console.log("User data from API:", data.user); // Check the user structure
      } else {
        onLoginError(data.message);
      }
    } catch (error: any) {
      onLoginError("Terjadi kesalahan saat menghubungi server.");
      console.error("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-normal text-primary dark:text-primary "
        >
          Username:
        </label>
        <input
          type="text"
          id="username"
          className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-black"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="max-w-sm">
        <label
          htmlFor="password"
          className="block text-sm font-normal text-primary dark:text-primary mt-6"
        >
          Password:
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-accent" />
            ) : (
              <Eye className="h-5 w-5 text-accent" />
            )}
          </div>
        </div>
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center mt-8 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
