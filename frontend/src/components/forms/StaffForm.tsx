/**
 * @fileoverview StaffForm component for creating and editing staff data.
 * This component provides a comprehensive form with fields for type, name, NIP, gender,
 * status, and position. It supports both creating new staff and editing existing ones.
 */

import React, { useState, useEffect } from "react";
import { Staff, StaffFormData } from "../../types/staffTypes";
import { useStaff } from "../../contexts/staffContext";
import { RefreshCw } from "lucide-react";

/** Props for StaffForm component. */
interface StaffFormProps {
  /** The staff data to pre-fill the form for editing. */
  staff?: Staff;
  /** Function to call when the form is submitted. */
  onSubmit: (formData: StaffFormData) => void;
  /** Whether the form is in a loading state. */
  isLoading?: boolean;
}

/**
 * A form component for creating and editing staff data.
 * It handles all staff fields and supports both creating and editing.
 *
 * @param {StaffFormProps} props - The component props.
 * @returns {JSX.Element} The rendered StaffForm component.
 */
const StaffForm: React.FC<StaffFormProps> = ({
  staff,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<StaffFormData>({
    type: "teacher",
    nama: "",
    nip: "",
    gender: "L",
    status: "PNS",
    jabatan: "",
  });

  /**
   * Populates the form with staff data if a staff prop is provided (for editing).
   * Otherwise, it resets the form to its default state.
   */
  useEffect(() => {
    if (staff) {
      setFormData({
        type: staff.type,
        nama: staff.nama,
        nip: staff.nip,
        gender: staff.gender,
        status: staff.status,
        jabatan: staff.jabatan,
      });
    } else {
      setFormData({
        type: "teacher",
        nama: "",
        nip: "",
        gender: "L",
        status: "PNS",
        jabatan: "",
      });
    }
  }, [staff]);

  /**
   * Handles input changes for form fields.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The change event from the input element.
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles the form submission event.
   * Calls the onSubmit prop with the form data.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Tipe <span className="text-[rgb(var(--color-error))]">*</span>
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className="form-input"
          required
          disabled={isLoading}
        >
          <option value="teacher">Guru</option>
          <option value="staff">Staf</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="nama"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Nama Lengkap <span className="text-[rgb(var(--color-error))]">*</span>
        </label>
        <input
          type="text"
          id="nama"
          name="nama"
          value={formData.nama}
          onChange={handleInputChange}
          className="form-input"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label
          htmlFor="nip"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          NIP <span className="text-[rgb(var(--color-error))]">*</span>
        </label>
        <input
          type="text"
          id="nip"
          name="nip"
          value={formData.nip}
          onChange={handleInputChange}
          className="form-input"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label
          htmlFor="gender"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Jenis Kelamin{" "}
          <span className="text-[rgb(var(--color-error))]">*</span>
        </label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
          className="form-input"
          required
          disabled={isLoading}
        >
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Status Kepegawaian{" "}
          <span className="text-[rgb(var(--color-error))]">*</span>
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="form-input"
          required
          disabled={isLoading}
        >
          <option value="PNS">PNS</option>
          <option value="PPPK">PPPK</option>
          <option value="CPNS">CPNS</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="jabatan"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Jabatan <span className="text-[rgb(var(--color-error))]">*</span>
        </label>
        <input
          type="text"
          id="jabatan"
          name="jabatan"
          value={formData.jabatan}
          onChange={handleInputChange}
          className="form-input"
          required
          disabled={isLoading}
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw size={16} className="animate-spin mr-2" />
              {staff ? "Memperbarui Data..." : "Menyimpan Data..."}
            </>
          ) : staff ? (
            "Perbarui Data"
          ) : (
            "Simpan Data"
          )}
        </button>
      </div>
    </form>
  );
};

export default StaffForm;
