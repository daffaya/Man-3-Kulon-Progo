import React, { useState } from "react";
import { AlbumFormData } from "../../types/galleryTypes";
import { Save, X, AlertCircle } from "lucide-react";

interface AlbumFormProps {
  initialData?: AlbumFormData;
  onSubmit: (data: AlbumFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AlbumForm: React.FC<AlbumFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<AlbumFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    cover_photo_id: initialData?.cover_photo_id || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Judul album wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, description: true });
    if (validateForm()) onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-semibackground dark:bg-backgroundgrey-800 p-6 rounded-lg shadow-md"
    >
      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium">
          Judul Album <span className="text-error">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Masukkan judul album"
            className={`form-input ${
              errors.title && touched.title ? "border-error" : ""
            }`}
            disabled={isLoading}
          />
          {errors.title && touched.title && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <AlertCircle className="h-5 w-5 text-error" />
            </div>
          )}
        </div>
        {errors.title && touched.title && (
          <p className="text-error text-sm flex items-center mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.title}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium">
          Deskripsi
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Masukkan deskripsi album (opsional)"
          rows={4}
          className="form-textarea"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-5 border-t border-gray-300 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn btn-secondary text-primary flex items-center"
        >
          <X size={18} className="mr-1" />
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary flex items-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save size={18} className="mr-1" />
          )}
          {initialData ? "Perbarui" : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default AlbumForm;
