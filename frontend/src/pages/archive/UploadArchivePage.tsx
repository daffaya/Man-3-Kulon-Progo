import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Upload, LogIn } from "lucide-react";
import Layout from "../../components/layout/Layout";
import { Navigate, useNavigate } from "react-router-dom";

interface Category {
  id: number;
  name: string;
  description: string | null;
}

const UploadArchivePage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
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

    if (!isLoggedIn) {
      setError("Silakan login untuk mengunggah arsip");
      navigate("/login", { state: { redirectTo: "/atmin/uploadArchive" } });
      setLoading(false);
      return;
    }

    if (!["arsiparis", "super_admin"].includes(user?.role || "")) {
      setError("Anda tidak memiliki akses untuk mengunggah arsip");
      setLoading(false);
      return;
    }

    if (!file) {
      setError("File diperlukan");
      setLoading(false);
      return;
    }
    if (!categoryId) {
      setError("Kategori diperlukan");
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
        // Reset file input
        const fileInput = document.getElementById("file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
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
    <Layout>
      <div className="min-h-screen bg-background dark:bg-semibackground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
            Upload Arsip
          </h1>
          {!isLoggedIn && (
            <div className="mb-6 p-4 rounded-xl bg-background dark:bg-semibackground border dark:border-gray-700 text-center">
              <p className="text-muted mb-4">
                Silakan login untuk mengunggah arsip
              </p>
              <button
                onClick={() =>
                  navigate("/login", {
                    state: { redirectTo: "/atmin/uploadArchive" },
                  })
                }
                className="btn-primary text-white font-semibold py-2 px-6 rounded-lg text-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50"
              >
                <LogIn className="h-5 w-5 mr-2 inline" />
                Login Sekarang
              </button>
            </div>
          )}
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-sm mb-4 text-center">{success}</p>
          )}
          {isLoggedIn &&
            ["arsiparis", "super_admin"].includes(user?.role || "") && (
              <div className="bg-white dark:bg-semibackground p-8 rounded-xl shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="file"
                      className="block text-sm font-medium text-foreground"
                    >
                      File (PDF/Word):
                    </label>
                    <input
                      type="file"
                      id="file"
                      accept=".pdf,.doc,.docx"
                      className="mt-2 block w-full border border-gray-300 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent text-foreground dark:text-black"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-foreground"
                    >
                      Deskripsi:
                    </label>
                    <input
                      type="text"
                      id="description"
                      className="mt-2 block w-full border border-gray-300 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent text-foreground dark:text-black"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-foreground"
                    >
                      Kategori:
                    </label>
                    <select
                      id="category"
                      className="mt-2 block w-full border border-gray-300 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent text-foreground dark:text-black"
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
                      className="block text-sm font-medium text-foreground"
                    >
                      Nomor Dokumen:
                    </label>
                    <input
                      type="text"
                      id="documentNumber"
                      className="mt-2 block w-full border border-gray-300 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent text-foreground dark:text-black"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="documentDate"
                      className="block text-sm font-medium text-foreground"
                    >
                      Tanggal Dokumen:
                    </label>
                    <input
                      type="date"
                      id="documentDate"
                      className="mt-2 block w-full border border-gray-300 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent text-foreground dark:text-black"
                      value={documentDate}
                      onChange={(e) => setDocumentDate(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-accent hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
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
            )}
        </div>
      </div>
    </Layout>
  );
};

export default UploadArchivePage;
