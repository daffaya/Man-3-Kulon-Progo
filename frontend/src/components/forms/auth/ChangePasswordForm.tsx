/**
 * @fileoverview Password change form component with validation.
 * This component provides a form for users to change their password, including fields for
 * current password, new password, and password confirmation. It includes client-side validation,
 * password visibility toggles, and loading states.
 */

import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Key, Lock } from "lucide-react";

/**
 * Props for the ChangePasswordForm component
 * @interface ChangePasswordFormProps
 */
interface ChangePasswordFormProps {
  /** Function to call when the form is submitted with valid data */
  onSubmit: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  /** Function to call when the form is cancelled */
  onCancel: () => void;
  /** Indicates whether the form is in a loading state */
  isLoading: boolean;
}

/**
 * Password change form component with validation.
 * Provides fields for current password, new password, and confirmation with
 * client-side validation and password visibility toggles.
 *
 * @param {ChangePasswordFormProps} props - The component props
 * @returns {JSX.Element} The rendered password change form
 */
const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<
    "currentPassword" | "newPassword" | "confirmPassword" | null
  >(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * Handles input field changes
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate field on change if it has been touched
    if (touched[name]) {
      validateField(name, value);
    }
  };

  /**
   * Handles input field blur events
   * @param {React.FocusEvent<HTMLInputElement>} e - The blur event
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFocusedField(null);
    validateField(name, formData[name as keyof typeof formData]);
  };

  /**
   * Validates a specific field
   * @param {string} name - The name of the field to validate
   * @param {string} value - The value of the field
   * @returns {boolean} Whether the field is valid
   */
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case "currentPassword":
        if (!value) {
          newErrors.currentPassword = "Password lama wajib diisi.";
        } else {
          delete newErrors.currentPassword;
        }
        break;
      case "newPassword":
        if (!value) {
          newErrors.newPassword = "Password baru wajib diisi.";
        } else if (value.length < 6) {
          newErrors.newPassword = "Password baru minimal 6 karakter.";
        } else {
          delete newErrors.newPassword;
        }
        // Also validate confirm password if it has a value
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = "Konfirmasi password tidak cocok.";
        } else if (formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;
      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Konfirmasi password baru wajib diisi.";
        } else if (value !== formData.newPassword) {
          newErrors.confirmPassword = "Konfirmasi password tidak cocok.";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
    return !newErrors[name];
  };

  /**
   * Validates all form fields
   * @returns {boolean} Whether the entire form is valid
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Password lama wajib diisi.";
    }
    if (!formData.newPassword) {
      newErrors.newPassword = "Password baru wajib diisi.";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password baru minimal 6 karakter.";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password baru wajib diisi.";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak cocok.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    if (!validate()) return;

    await onSubmit({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  /**
   * Toggles password visibility for a specific field
   * @param {"current" | "new" | "confirm"} field - The field to toggle
   */
  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    switch (field) {
      case "current":
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case "new":
        setShowNewPassword(!showNewPassword);
        break;
      case "confirm":
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  /**
   * Gets the icon color based on field focus state
   * @param {"currentPassword" | "newPassword" | "confirmPassword"} field - The field to check
   * @returns {string} The CSS class for the icon color
   */
  const getIconColor = (
    field: "currentPassword" | "newPassword" | "confirmPassword"
  ) => (focusedField === field ? "text-accent" : "text-secondary");

  /**
   * Renders a loading spinner
   * @returns {JSX.Element} The spinner SVG element
   */
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground mb-4">
        Ubah Password
      </h3>

      <div>
        <label
          htmlFor="currentPassword"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Password Lama
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key
              className={`h-5 w-5 transition-colors duration-200 ${getIconColor(
                "currentPassword"
              )}`}
            />
          </div>
          <input
            id="currentPassword"
            name="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            value={formData.currentPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input pl-10 pr-10 ${
              focusedField === "currentPassword" ? "ring-2 ring-accent/50" : ""
            } ${
              errors.currentPassword && touched.currentPassword
                ? "border-red-500 focus:ring-red-500"
                : ""
            }`}
            placeholder="Masukkan password lama"
            onFocus={() => setFocusedField("currentPassword")}
            disabled={isLoading}
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={() => togglePasswordVisibility("current")}
          >
            {showCurrentPassword ? (
              <EyeOff className="h-5 w-5 text-secondary hover:text-foreground transition-colors duration-200" />
            ) : (
              <Eye className="h-5 w-5 text-secondary hover:text-foreground transition-colors duration-200" />
            )}
          </div>
        </div>
        {errors.currentPassword && touched.currentPassword && (
          <p className="text-red-500 text-xs mt-1 font-medium">
            {errors.currentPassword}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Password Baru
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock
              className={`h-5 w-5 transition-colors duration-200 ${getIconColor(
                "newPassword"
              )}`}
            />
          </div>
          <input
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            value={formData.newPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input pl-10 pr-10 ${
              focusedField === "newPassword" ? "ring-2 ring-accent/50" : ""
            } ${
              errors.newPassword && touched.newPassword
                ? "border-red-500 focus:ring-red-500"
                : ""
            }`}
            placeholder="Masukkan password baru"
            onFocus={() => setFocusedField("newPassword")}
            disabled={isLoading}
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={() => togglePasswordVisibility("new")}
          >
            {showNewPassword ? (
              <EyeOff className="h-5 w-5 text-secondary hover:text-foreground transition-colors duration-200" />
            ) : (
              <Eye className="h-5 w-5 text-secondary hover:text-foreground transition-colors duration-200" />
            )}
          </div>
        </div>
        {errors.newPassword && touched.newPassword && (
          <p className="text-red-500 text-xs mt-1 font-medium">
            {errors.newPassword}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Konfirmasi Password Baru
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
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input pl-10 pr-10 ${
              focusedField === "confirmPassword" ? "ring-2 ring-accent/50" : ""
            } ${
              errors.confirmPassword && touched.confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : ""
            }`}
            placeholder="Masukkan kembali password baru"
            onFocus={() => setFocusedField("confirmPassword")}
            disabled={isLoading}
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={() => togglePasswordVisibility("confirm")}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-secondary hover:text-foreground transition-colors duration-200" />
            ) : (
              <Eye className="h-5 w-5 text-secondary hover:text-foreground transition-colors duration-200" />
            )}
          </div>
        </div>
        {errors.confirmPassword && touched.confirmPassword && (
          <p className="text-red-500 text-xs mt-1 font-medium">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn btn-secondary transform hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary flex justify-center items-center py-3 transform hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
        >
          {isLoading ? (
            <>
              {renderSpinner()}
              Menyimpan...
            </>
          ) : (
            "Simpan Password"
          )}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
