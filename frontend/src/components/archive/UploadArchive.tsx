import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Upload } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string | null;
}

const UploadArchive: React.FC = () => {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/api/archives/categories`
        );
        const data = await response.json();
        if (response.ok && data.success) {
          setCategories(data.data);
        } else {
          setError(data.error || "Gagal memuat kategori");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat kategori");
      }
    };
    fetchCategories();
  }, []);

  // Handle form submit
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!file) {
      setError("File diperlukan");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("category_id", categoryId);
    formData.append("document_number", documentNumber);
    formData.append("document_date", documentDate);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/archives`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message);
        // Reset form
        setFile(null);
        setDescription("");
        setCategoryId("");
        setDocumentNumber("");
        setDocumentDate("");
      } else {
        setError(data.error || "Gagal mengunggah arsip");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengunggah arsip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-background">
      <div className="bg-white dark:bg-semibackground p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Upload Arsip
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-normal text-primary dark:text-primary"
            >
              File (PDF/Word):
            </label>
            <input
              type="file"
              id="file"
              accept=".pdf,.doc,.docx"
              className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-black"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-normal text-primary dark:text-primary"
            >
              Deskripsi:
            </label>
            <input
              type="text"
              id="description"
              className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-black"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-normal text-primary dark:text-primary"
            >
              Kategori:
            </label>
            <select
              id="category"
              className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-black"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
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
              htmlFor="documentNumber"
              className="block text-sm font-normal text-primary dark:text-primary"
            >
              Nomor Dokumen:
            </label>
            <input
              type="text"
              id="documentNumber"
              className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-black"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="documentDate"
              className="block text-sm font-normal text-primary dark:text-primary"
            >
              Tanggal Dokumen:
            </label>
            <input
              type="date"
              id="documentDate"
              className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-black"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center mt-6 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? (
              "Uploading..."
            ) : (
              <div className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadArchive;
