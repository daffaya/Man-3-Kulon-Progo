/**
 * @fileoverview Form component for creating and editing staff records.
 * Handles input fields for staff type, name, NIP, gender, employment status, and position.
 * Supports both new entry creation and existing record editing.
 */

import React, { useState, useEffect } from "react";
import { Staff, StaffFormData } from "../../types/staffTypes";
import { RefreshCw } from "lucide-react";

/** Props for the StaffForm component */
interface StaffFormProps {
  /** Existing staff data to pre-fill the form (edit mode) */
  staff?: Staff;
  /** Callback invoked on form submission with the collected data */
  onSubmit: (formData: StaffFormData) => void;
  /** Indicates if the form is in a submitting/loading state */
  isLoading?: boolean;
}

/**
 * StaffForm component.
 * Renders a controlled form with validation and responsive disabled state during submission.
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

  // Pre-fill form when editing an existing staff member
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
      // Reset to defaults for create mode
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipe */}
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

      {/* Nama Lengkap */}
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

      {/* NIP */}
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

      {/* Jenis Kelamin */}
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

      {/* Status Kepegawaian */}
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

      {/* Jabatan */}
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

      {/* Submit Button */}
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
