/**
 * @fileoverview Modal component for editing archive information.
 * This component provides a form interface for updating archive details including
 * file upload, description, category, document number, and document date.
 */

import React, { useState } from "react";
import { Archive, Category, EditFormState } from "../../types/archiveTypes";

/**
 * Props for the EditModal component
 * @interface EditModalProps
 */
interface EditModalProps {
  /** The archive data to be edited */
  archive: Archive;
  /** List of available categories for the archive */
  categories: Category[];
  /** Function to call when the modal is closed */
  onClose: () => void;
  /** Function to call when the form is submitted */
  onSubmit: (formData: FormData) => Promise<void>;
  /** Loading state indicator */
  loading: boolean;
}

/**
 * Modal component for editing archive information.
 * Displays a form with fields for file upload, description, category selection,
 * document number, and document date.
 *
 * @param {EditModalProps} props - The component props
 * @returns {JSX.Element} The rendered modal component
 */
const EditModal: React.FC<EditModalProps> = ({
  archive,
  categories,
  onClose,
  onSubmit,
  loading,
}) => {
  const [formState, setFormState] = useState<EditFormState>({
    file: null,
    description: archive.description || "",
    categoryId:
      categories
        .find((cat) => cat.name === archive.category_name)
        ?.id.toString() || "",
    documentNumber: archive.document_number || "",
    documentDate: archive.document_date || "",
  });

  /**
   * Handles form field changes
   * @param {keyof EditFormState} field - The form field to update
   * @returns {Function} A function that takes the new value and updates the form state
   */
  const handleChange =
    (field: keyof EditFormState) => (value: string | File | null) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    };

  /**
   * Handles form submission
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (formState.file) formData.append("file", formState.file);
    formData.append("description", formState.description);
    formData.append("category_id", formState.categoryId);
    formData.append("document_number", formState.documentNumber);
    formData.append("document_date", formState.documentDate);
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-foreground">Edit Arsip</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="editFile"
              className="block text-sm font-medium text-foreground mb-1"
            >
              File (PDF/Word, kosongkan jika tidak diganti):
            </label>
            <input
              type="file"
              id="editFile"
              accept=".pdf,.doc,.docx"
              className="form-input w-full"
              onChange={(e) =>
                handleChange("file")(e.target.files?.[0] || null)
              }
            />
          </div>
          <div>
            <label
              htmlFor="editDescription"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Deskripsi:
            </label>
            <input
              type="text"
              id="editDescription"
              className="form-input w-full"
              value={formState.description}
              onChange={(e) => handleChange("description")(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="editCategory"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Kategori:
            </label>
            <select
              id="editCategory"
              className="form-input w-full"
              value={formState.categoryId}
              onChange={(e) => handleChange("categoryId")(e.target.value)}
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="editDocumentNumber"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Nomor Dokumen:
            </label>
            <input
              type="text"
              id="editDocumentNumber"
              className="form-input w-full"
              value={formState.documentNumber}
              onChange={(e) => handleChange("documentNumber")(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="editDocumentDate"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Tanggal Dokumen:
            </label>
            <input
              type="date"
              id="editDocumentDate"
              className="form-input w-full"
              value={formState.documentDate}
              onChange={(e) => handleChange("documentDate")(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
