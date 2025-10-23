// src/components/forms/StudentForm.tsx
import React, { useState, useEffect } from "react";
import { StudentFormData } from "../../types/studentTypes";
import { useClasses } from "../../hooks/useClasses";

interface StudentFormProps {
  initialData?: Partial<StudentFormData>;
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "class_id" ? parseInt(value) : value,
    }));

    // Clear error when user starts typing
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
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          NISN <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nisn"
          name="nisn"
          value={formData.nisn}
          onChange={handleChange}
          className={`form-input ${errors.nisn ? "border-red-500" : ""}`}
          placeholder="Masukkan NISN"
        />
        {errors.nisn && (
          <p className="text-red-500 text-sm mt-1">{errors.nisn}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${errors.name ? "border-red-500" : ""}`}
          placeholder="Masukkan nama lengkap"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="class_id"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Kelas <span className="text-red-500">*</span>
        </label>
        <select
          id="class_id"
          name="class_id"
          value={formData.class_id}
          onChange={handleChange}
          className={`form-input ${errors.class_id ? "border-red-500" : ""}`}
        >
          <option value={0}>Pilih Kelas</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.academic_year} - {cls.semester})
            </option>
          ))}
        </select>
        {errors.class_id && (
          <p className="text-red-500 text-sm mt-1">{errors.class_id}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="academic_year"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Tahun Ajaran <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="academic_year"
          name="academic_year"
          value={formData.academic_year}
          onChange={handleChange}
          className={`form-input ${
            errors.academic_year ? "border-red-500" : ""
          }`}
          placeholder="Contoh: 2024/2025"
        />
        {errors.academic_year && (
          <p className="text-red-500 text-sm mt-1">{errors.academic_year}</p>
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
