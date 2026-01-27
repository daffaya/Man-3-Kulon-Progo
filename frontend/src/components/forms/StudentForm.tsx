/**
 * @fileoverview StudentForm component for creating and editing student data.
 * This module provides a reusable form with comprehensive fields for student information.
 */

import React, { useState, useEffect } from "react";
import { StudentFormData, AcademicYear } from "../../types/studentTypes";
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
 * Generates academic year options for the dropdown.
 * Creates options for the current year and 5 years before/after.
 * @returns {AcademicYear[]} Array of academic year options
 */
const generateAcademicYearOptions = (): AcademicYear[] => {
  const currentYear = new Date().getFullYear();
  const options: AcademicYear[] = [];

  for (let i = -5; i <= 5; i++) {
    const year = currentYear + i;
    const value = `${year}/${year + 1}`;
    options.push({
      value,
      label: `${year}/${year + 1}`,
    });
  }

  return options.reverse(); // Show most recent years first
};

/**
 * Generates angkatan (batch) options for the dropdown.
 * Creates options for the last 10 years.
 * @returns {Array<{value: string, label: string}>} Array of angkatan options
 */
const generateAngkatanOptions = () => {
  const currentYear = new Date().getFullYear();
  const options = [];

  for (let i = 0; i < 10; i++) {
    const year = currentYear - i;
    options.push({
      value: year.toString(),
      label: year.toString(),
    });
  }

  return options;
};

/**
 * A form component for creating and editing student information.
 * It includes comprehensive fields for student personal and academic data.
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
    jenis_kelamin: undefined,
    class_id: 0,
    academic_year:
      new Date().getFullYear().toString() +
      "/" +
      (new Date().getFullYear() + 1).toString(),
    nik: "",
    birth_place: "",
    birth_date: "",
    address: "",
    phone: "",
    parent_name: "",
    angkatan: new Date().getFullYear().toString(),
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { classes } = useClasses();
  const academicYearOptions = generateAcademicYearOptions();
  const angkatanOptions = generateAngkatanOptions();

  /**
   * Validates the form data against a set of rules.
   * @returns {boolean} Returns true if the form is valid, otherwise false.
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nisn.trim()) {
      newErrors.nisn = "NISN wajib diisi";
    } else if (!/^\d{10}$/.test(formData.nisn)) {
      newErrors.nisn = "NISN harus 10 digit angka";
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

    if (formData.nik && !/^\d{16}$/.test(formData.nik)) {
      newErrors.nik = "NIK harus 16 digit angka";
    }

    if (formData.phone && !/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Nomor telepon harus berupa angka";
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
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - The input change event.
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
      {/* Basic Information Section */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h3 className="text-lg font-medium mb-3">Informasi Dasar</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              maxLength={10}
              className={`form-input ${
                errors.nisn ? "border-[rgb(var(--color-error))]" : ""
              }`}
              placeholder="Masukkan 10 digit NISN"
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
              Nama Lengkap{" "}
              <span className="text-[rgb(var(--color-error))]">*</span>
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
              htmlFor="jenis_kelamin"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Jenis Kelamin
            </label>
            <select
              id="jenis_kelamin"
              name="jenis_kelamin"
              value={formData.jenis_kelamin || ""}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="nik"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              NIK
            </label>
            <input
              type="text"
              id="nik"
              name="nik"
              value={formData.nik || ""}
              onChange={handleChange}
              maxLength={16}
              className={`form-input ${
                errors.nik ? "border-[rgb(var(--color-error))]" : ""
              }`}
              placeholder="Masukkan 16 digit NIK"
            />
            {errors.nik && (
              <p className="text-[rgb(var(--color-error))] text-sm mt-1">
                {errors.nik}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Birth Information Section */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h3 className="text-lg font-medium mb-3">Informasi Kelahiran</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="birth_place"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Tempat Lahir
            </label>
            <input
              type="text"
              id="birth_place"
              name="birth_place"
              value={formData.birth_place || ""}
              onChange={handleChange}
              className="form-input"
              placeholder="Masukkan tempat lahir"
            />
          </div>

          <div>
            <label
              htmlFor="birth_date"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Tanggal Lahir
            </label>
            <input
              type="date"
              id="birth_date"
              name="birth_date"
              value={formData.birth_date || ""}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h3 className="text-lg font-medium mb-3">Informasi Kontak</h3>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium mb-1 text-foreground"
          >
            Alamat
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            rows={3}
            className="form-input"
            placeholder="Masukkan alamat lengkap"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Nomor Telepon
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className={`form-input ${
                errors.phone ? "border-[rgb(var(--color-error))]" : ""
              }`}
              placeholder="Masukkan nomor telepon"
            />
            {errors.phone && (
              <p className="text-[rgb(var(--color-error))] text-sm mt-1">
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="parent_name"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Nama Orang Tua/Wali
            </label>
            <input
              type="text"
              id="parent_name"
              name="parent_name"
              value={formData.parent_name || ""}
              onChange={handleChange}
              className="form-input"
              placeholder="Masukkan nama orang tua/wali"
            />
          </div>
        </div>
      </div>

      {/* Academic Information Section */}
      <div className="pb-4 mb-4">
        <h3 className="text-lg font-medium mb-3">Informasi Akademik</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="angkatan"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Angkatan (Tahun Masuk)
            </label>
            <select
              id="angkatan"
              name="angkatan"
              value={formData.angkatan || ""}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Pilih Angkatan</option>
              {angkatanOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="academic_year"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Tahun Ajaran{" "}
              <span className="text-[rgb(var(--color-error))]">*</span>
            </label>
            <select
              id="academic_year"
              name="academic_year"
              value={formData.academic_year}
              onChange={handleChange}
              className={`form-input ${
                errors.academic_year ? "border-[rgb(var(--color-error))]" : ""
              }`}
            >
              <option value="">Pilih Tahun Ajaran</option>
              {academicYearOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.academic_year && (
              <p className="text-[rgb(var(--color-error))] text-sm mt-1">
                {errors.academic_year}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
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
        </div>
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
