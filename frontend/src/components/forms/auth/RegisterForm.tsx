import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface RegisterFormProps {
  onSubmit: (userData: {
    username: string;
    password: string;
    role: string;
  }) => Promise<void>;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("arsiparis"); // Default role
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Validate that passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await onSubmit({ username, password, role });
    } catch (error: any) {
      setError("Terjadi kesalahan saat menghubungi server.");
      console.error("Error during registration:", error);
    }
  };

  // Available roles
  const roles = [
    { value: "arsiparis", label: "Arsiparis" },
    { value: "pengelola_bmn", label: "Pengelola BMN" },
    { value: "guru_bk", label: "Guru BK" },
    { value: "jurnalis", label: "Jurnalis" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="username"
          className="block text-sm font-normal text-primary dark:text-primary"
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

      <div>
        <label
          htmlFor="role"
          className="block text-sm font-normal text-primary dark:text-primary"
        >
          Role:
        </label>
        <select
          id="role"
          className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-black"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          {roles.map((roleOption) => (
            <option key={roleOption.value} value={roleOption.value}>
              {roleOption.label}
            </option>
          ))}
        </select>
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

      <div className="max-w-sm">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-normal text-primary dark:text-primary mt-6"
        >
          Confirm Password:
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-black"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={toggleConfirmPasswordVisibility}
          >
            {showConfirmPassword ? (
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
        >
          Register
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
