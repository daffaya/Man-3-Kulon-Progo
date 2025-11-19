/**
 * @fileoverview StudentForm component for creating and editing student data.
 * This module provides a reusable form with fields for NISN, name, class, and academic year, including validation logic.
 */

import React, { useState, useEffect } from "react";
import { StudentFormData } from "../../types/studentTypes";
import { useClasses } from "../../hooks/useClasses";

/**
 * Props for the StudentForm component.
 */
interface StudentFormProps {
  /** The initial data to pre-fill the form for editing. */
  initialData?: Partial<StudentFormData>;
  /** Function to call when the form is submitted with valid data. */
  onSubmit: (data: StudentFormData) => Promise<void>;
  /** Function to call when the form is cancelled. */
  onCancel: () => void;
  /** Whether the form is in a loading state. */
  isLoading?: boolean;
}

/**
 * A form component for creating and editing student information.
 * It includes fields for NISN, name, class selection, and academic year, with client-side validation.
 *
 * @param {StudentFormProps} props - The component props.
 * @returns {JSX.Element} The rendered StudentForm component.
 */
const StudentForm: React.FC<StudentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    nisn: "",
    name: "",
    class_id: 0,
    academic_year:
      new Date().getFullYear().toString() +
      "/" +
      (new Date().getFullYear() + 1).toString(),
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { classes } = useClasses();

  /**
   * Validates the form data against a set of rules.
   * @returns {boolean} Returns true if the form is valid, otherwise false.
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nisn.trim()) {
      newErrors.nisn = "NISN wajib diisi";
    } else if (!/^\d+$/.test(formData.nisn)) {
      newErrors.nisn = "NISN harus berupa angka";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Nama siswa wajib diisi";
    }

    if (!formData.class_id) {
      newErrors.class_id = "Kelas wajib dipilih";
    }

    if (!formData.academic_year.trim()) {
      newErrors.academic_year = "Tahun ajaran wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the form submission event.
   * It validates the form and calls the onSubmit prop if validation passes.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  /**
   * Handles input changes for form fields.
   * Updates the form state and clears any existing validation errors for the changed field.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The input change event.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "class_id" ? parseInt(value) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="nisn"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          NISN <span className="text-[rgb(var(--color-error))]">*</span>
        </label>
        <input
          type="text"
          id="nisn"
          name="nisn"
          value={formData.nisn}
          onChange={handleChange}
          className={`form-input ${
            errors.nisn ? "border-[rgb(var(--color-error))]" : ""
          }`}
          placeholder="Masukkan NISN"
        />
        {errors.nisn && (
          <p className="text-[rgb(var(--color-error))] text-sm mt-1">
            {errors.nisn}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Nama Lengkap <span className="text-[rgb(var(--color-error))]">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${
            errors.name ? "border-[rgb(var(--color-error))]" : ""
          }`}
          placeholder="Masukkan nama lengkap"
        />
        {errors.name && (
          <p className="text-[rgb(var(--color-error))] text-sm mt-1">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="class_id"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Kelas <span className="text-[rgb(var(--color-error))]">*</span>
        </label>
        <select
          id="class_id"
          name="class_id"
          value={formData.class_id}
          onChange={handleChange}
          className={`form-input ${
            errors.class_id ? "border-[rgb(var(--color-error))]" : ""
          }`}
        >
          <option value={0}>Pilih Kelas</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.academic_year} - {cls.semester})
            </option>
          ))}
        </select>
        {errors.class_id && (
          <p className="text-[rgb(var(--color-error))] text-sm mt-1">
            {errors.class_id}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="academic_year"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Tahun Ajaran <span className="text-[rgb(var(--color-error))]">*</span>
        </label>
        <input
          type="text"
          id="academic_year"
          name="academic_year"
          value={formData.academic_year}
          onChange={handleChange}
          className={`form-input ${
            errors.academic_year ? "border-[rgb(var(--color-error))]" : ""
          }`}
          placeholder="Contoh: 2024/2025"
        />
        {errors.academic_year && (
          <p className="text-[rgb(var(--color-error))] text-sm mt-1">
            {errors.academic_year}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          Batal
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : initialData ? "Update" : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
