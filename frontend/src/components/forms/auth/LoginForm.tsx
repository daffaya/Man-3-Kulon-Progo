// frontend/src/components/forms/auth/LoginForm.tsx
import React, { useState } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: (userData: {
    user: { username: string; role: string; avatar?: string };
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
  const [focusedField, setFocusedField] = useState<
    "username" | "password" | null
  >(null);

  const BACKEND_API_URL =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Pastikan URL avatar lengkap sebelum menyimpan
        if (data.user.avatar && !data.user.avatar.startsWith("http")) {
          data.user.avatar = `${BACKEND_API_URL}${data.user.avatar}`;
        }
        onLoginSuccess({ user: data.user, token: data.token });
      } else {
        onLoginError(data.message || "Login gagal.");
      }
    } catch {
      onLoginError("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const renderSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const getIconColor = (field: "username" | "password") =>
    focusedField === field ? "text-accent" : "text-secondary";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Username
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User
              className={`h-5 w-5 transition-colors duration-200 ${getIconColor(
                "username"
              )}`}
            />
          </div>
          <input
            type="text"
            id="username"
            className={`form-input pl-10 ${
              focusedField === "username" ? "ring-2 ring-accent/50" : ""
            }`}
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setFocusedField("username")}
            onBlur={() => setFocusedField(null)}
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock
              className={`h-5 w-5 transition-colors duration-200 ${getIconColor(
                "password"
              )}`}
            />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            className={`form-input pl-10 pr-10 ${
              focusedField === "password" ? "ring-2 ring-accent/50" : ""
            }`}
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            required
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-secondary hover:text-foreground transition-colors duration-200" />
            ) : (
              <Eye className="h-5 w-5 text-secondary hover:text-foreground transition-colors duration-200" />
            )}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="btn btn-primary w-full flex justify-center items-center py-3 transform hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
          disabled={loading}
        >
          {loading ? (
            <>
              {renderSpinner()}
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
