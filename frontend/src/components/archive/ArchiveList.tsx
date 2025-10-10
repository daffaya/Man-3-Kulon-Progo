import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Download } from "lucide-react";

interface Archive {
  id: number;
  file_name: string;
  description: string | null;
  category_name: string | null;
  document_number: string | null;
  document_date: string | null;
  upload_date: string;
}

const ArchiveList: React.FC = () => {
  const { token } = useAuth();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArchives = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/api/archives`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (response.ok && data.success) {
          setArchives(data.data);
        } else {
          setError(data.error || "Gagal memuat arsip");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat arsip");
      } finally {
        setLoading(false);
      }
    };
    fetchArchives();
  }, [token]);

  const handleDownload = async (id: number, fileName: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/archives/${id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Gagal mendownload arsip");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Gagal mendownload arsip");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-background">
      <div className="bg-white dark:bg-semibackground p-8 rounded shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Daftar Arsip
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {loading && (
          <p className="text-gray-500 text-sm mb-4">Memuat arsip...</p>
        )}
        {archives.length === 0 && !loading ? (
          <p className="text-gray-500 text-sm">Tidak ada arsip</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-left">ID</th>
                <th className="border border-gray-300 p-2 text-left">
                  Nama File
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Deskripsi
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Kategori
                </th>
                <th className="border border-gray-300 p-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {archives.map((archive) => (
                <tr key={archive.id}>
                  <td className="border border-gray-300 p-2">{archive.id}</td>
                  <td className="border border-gray-300 p-2">
                    {archive.file_name}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {archive.description || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {archive.category_name || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() =>
                        handleDownload(archive.id, archive.file_name)
                      }
                      className="flex items-center text-sm text-white bg-accent hover:bg-hover py-1 px-2 rounded"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ArchiveList;
