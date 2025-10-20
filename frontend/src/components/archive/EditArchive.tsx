import React, { useState } from "react";
import { Archive, Category, EditFormState } from "../../types/archiveTypes";

interface EditModalProps {
  archive: Archive;
  categories: Category[];
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
}

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

  const handleChange =
    (field: keyof EditFormState) => (value: string | File | null) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    };

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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Edit Arsip</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="editFile"
              className="block text-sm font-medium text-foreground"
            >
              File (PDF/Word, kosongkan jika tidak diganti):
            </label>
            <input
              type="file"
              id="editFile"
              accept=".pdf,.doc,.docx"
              className="form-input w-full mt-1"
              onChange={(e) =>
                handleChange("file")(e.target.files?.[0] || null)
              }
            />
          </div>
          <div>
            <label
              htmlFor="editDescription"
              className="block text-sm font-medium text-foreground"
            >
              Deskripsi:
            </label>
            <input
              type="text"
              id="editDescription"
              className="form-input w-full mt-1"
              value={formState.description}
              onChange={(e) => handleChange("description")(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="editCategory"
              className="block text-sm font-medium text-foreground"
            >
              Kategori:
            </label>
            <select
              id="editCategory"
              className="form-input w-full mt-1"
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
              className="block text-sm font-medium text-foreground"
            >
              Nomor Dokumen:
            </label>
            <input
              type="text"
              id="editDocumentNumber"
              className="form-input w-full mt-1"
              value={formState.documentNumber}
              onChange={(e) => handleChange("documentNumber")(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="editDocumentDate"
              className="block text-sm font-medium text-foreground"
            >
              Tanggal Dokumen:
            </label>
            <input
              type="date"
              id="editDocumentDate"
              className="form-input w-full mt-1"
              value={formState.documentDate}
              onChange={(e) => handleChange("documentDate")(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
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
