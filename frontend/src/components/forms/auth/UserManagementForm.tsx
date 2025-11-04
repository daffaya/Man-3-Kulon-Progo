// frontend/src/components/forms/auth/UserManagementForm.tsx
import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Save,
  X,
  User as UserIcon,
  Shield,
  Lock,
} from "lucide-react";
import { User, UserFormData } from "../../../types/userTypes";

interface UserManagementFormProps {
  onSubmit: (userData: UserFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: User | null;
  isLoading?: boolean;
}

const UserManagementForm: React.FC<UserManagementFormProps> = ({
  onSubmit,
  onCancel,
  initialData = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    password: "",
    role: "arsiparis",
    full_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username,
        password: "", // Don't pre-fill password for security
        role: initialData.role,
        full_name: initialData.full_name || "",
      });
    }
  }, [initialData]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate that passwords match if password is provided
    if (formData.password && formData.password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: any) {
      setError(error.message || "An error occurred");
    }
  };

  // Available roles
  const roles = [
    { value: "super_admin", label: "Super Admin" },
    { value: "arsiparis", label: "Arsiparis" },
    { value: "pengelola_bmn", label: "Pengelola BMN" },
    { value: "guru_bk", label: "Guru BK" },
    { value: "jurnalis", label: "Jurnalis" },
  ];

  /**
   * Utility function to determine icon color based on focus.
   */
  const getIconColor = (field: string) =>
    focusedField === field
      ? "text-[rgba(var(--color-accent),1)]"
      : "text-secondary";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {initialData ? "Edit User" : "Tambah User Baru"}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md text-sm mb-4 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-foreground dark:text-foreground mb-2"
          >
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon
                className={`h-5 w-5 transition-colors duration-200 ${getIconColor(
                  "username"
                )}`}
              />
            </div>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-input pl-10 ${
                focusedField === "username"
                  ? "ring-2 ring-[rgba(var(--color-accent),0.5)]"
                  : ""
              }`}
              placeholder="Masukkan username"
              value={formData.username}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField(null)}
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-foreground dark:text-foreground mb-2"
          >
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            className={`form-input w-full ${
              focusedField === "full_name"
                ? "ring-2 ring-[rgba(var(--color-accent),0.5)]"
                : ""
            }`}
            placeholder="Masukkan nama lengkap"
            value={formData.full_name}
            onChange={handleInputChange}
            onFocus={() => setFocusedField("full_name")}
            onBlur={() => setFocusedField(null)}
            required
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-foreground dark:text-foreground mb-2"
          >
            Role
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield
                className={`h-5 w-5 transition-colors duration-200 ${getIconColor(
                  "role"
                )}`}
              />
            </div>
            <select
              id="role"
              name="role"
              className={`form-input pl-10 w-full ${
                focusedField === "role"
                  ? "ring-2 ring-[rgba(var(--color-accent),0.5)]"
                  : ""
              }`}
              value={formData.role}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("role")}
              onBlur={() => setFocusedField(null)}
              required
            >
              {roles.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground dark:text-foreground mb-2"
          >
            Password {initialData && "(Kosongkan jika tidak ingin mengubah)"}
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
              name="password"
              className={`form-input pl-10 pr-10 ${
                focusedField === "password"
                  ? "ring-2 ring-[rgba(var(--color-accent),0.5)]"
                  : ""
              }`}
              placeholder="Masukkan password"
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              required={!initialData} // Password is required only for new users
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-secondary hover:text-foreground transition-colors duration-200" />
              ) : (
                <Eye className="h-5 w-5 text-secondary hover:text-foreground transition-colors duration-200" />
              )}
            </button>
          </div>
        </div>

        {formData.password && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-foreground dark:text-foreground mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock
                  className={`h-5 w-5 transition-colors duration-200 ${getIconColor(
                    "confirmPassword"
                  )}`}
                />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className={`form-input pl-10 pr-10 ${
                  focusedField === "confirmPassword"
                    ? "ring-2 ring-[rgba(var(--color-accent),0.5)]"
                    : ""
                }`}
                placeholder="Konfirmasi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField("confirmPassword")}
                onBlur={() => setFocusedField(null)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={toggleConfirmPasswordVisibility}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-secondary hover:text-foreground transition-colors duration-200" />
                ) : (
                  <Eye className="h-5 w-5 text-secondary hover:text-foreground transition-colors duration-200" />
                )}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary transform hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary flex items-center transform hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {initialData ? "Update User" : "Tambah User"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserManagementForm;
