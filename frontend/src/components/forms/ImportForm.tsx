import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { importStudents } from "../../services/importService";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  X,
  CheckCircle,
  Users,
  UserPlus,
  UserMinus,
  AlertTriangle,
} from "lucide-react";
import { ImportResult } from "../../types/importTypes";

interface ImportFormProps {
  onSuccess?: () => void;
}

export const ImportForm: React.FC<ImportFormProps> = ({ onSuccess }) => {
  const { token } = useAuth();
  const { showSuccessToast, showErrorToast, showWarningToast } =
    useToastMessage();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  // Reference to the modal content
  const modalRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[], event: any) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setResult(null);
      }

      // Handle file rejections
      if (fileRejections.length > 0) {
        const error = fileRejections[0].errors[0];
        if (error.code === "file-too-large") {
          showErrorToast("Ukuran file terlalu besar. Maksimal 5MB");
        } else if (error.code === "file-invalid-type") {
          showErrorToast(
            "Tipe file tidak valid. Hanya .xlsx dan .xls yang diperbolehkan"
          );
        } else {
          showErrorToast("Error: " + error.message);
        }
      }
    },
    [showErrorToast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {},
  });

  const handleImport = async () => {
    if (!file) {
      showWarningToast("Silakan pilih file Excel terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      const response = await importStudents(file, token || "");
      setResult(response);

      // **FIX: Lebih akurat message berdasarkan data**
      let message = `Import selesai! ${response.success} siswa berhasil ditambahkan.`;

      if (response.updated > 0) {
        message += ` ${response.updated} siswa diupdate.`;
      }

      if (response.skipped > 0) {
        message += ` ${response.skipped} siswa dilewati:`;
        if (response.skipBreakdown) {
          const reasons = [];
          if (response.skipBreakdown.duplicates > 0)
            reasons.push(`${response.skipBreakdown.duplicates} duplikat`);
          if (response.skipBreakdown.summaryRows > 0)
            reasons.push(`${response.skipBreakdown.summaryRows} footer`);
          if (response.skipBreakdown.classNotFound > 0)
            reasons.push(`${response.skipBreakdown.classNotFound} kelas salah`);
          if (response.skipBreakdown.missingData > 0)
            reasons.push(`${response.skipBreakdown.missingData} kosong`);
          message += ` (${reasons.join(", ")})`;
        } else {
          message += ` (lihat detail di bawah)`;
        }
      }

      if (response.failed > 0) {
        message += ` ${response.failed} gagal (lihat error)`;
      }

      if (response.failed > 0) {
        showWarningToast(message);
      } else {
        showSuccessToast(message);
      }
    } catch (error: any) {
      showErrorToast(error.message || "Gagal mengimport data siswa");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Cek token dulu
    if (!token) {
      showErrorToast("Sesi telah berakhir. Silakan login kembali.");
      // Redirect ke login setelah delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return;
    }

    try {
      const templateURL = `${
        import.meta.env.VITE_BACKEND_API_URL
      }/api/students/template`;

      const link = document.createElement("a");
      link.href = templateURL;
      link.download = "template-import-siswa.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Tampilkan toast sukses download
      showSuccessToast("Template berhasil diunduh");
    } catch (error) {
      showErrorToast("Gagal mengunduh template");
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
  };

  // Handle click outside the modal content
  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      if (onSuccess) {
        onSuccess(); // Close the modal by calling onSuccess
      }
    }
  };

  useEffect(() => {
    if (!token) {
      showErrorToast("Sesi telah berakhir. Silakan login kembali.");
      // Redirect ke login setelah delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  }, [token, showErrorToast]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClickOutside}
    >
      <div
        ref={modalRef}
        className="max-w-5xl w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-h-[90vh] overflow-y-auto relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onSuccess}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Import Data Siswa</h2>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Petunjuk Import:
          </h3>
          <ol className="list-decimal pl-5 space-y-1 text-blue-700 dark:text-blue-400">
            <li>Unduh template Excel yang telah disediakan</li>
            <li>
              Isi data siswa dengan format: NISN, Nama Lengkap, Tingkat-Rombel,
              Jenis Kelamin
            </li>
            <li>Untuk Tingkat-Rombel gunakan format: X-A, X-B, XI-A, dll</li>
            <li>Untuk Jenis Kelamin isi dengan L/P</li>
            <li>Upload file Excel yang sudah diisi</li>
            <li>Klik tombol "Import Data" untuk memproses</li>
          </ol>
          <div className="mt-3">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Template
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
            }`}
          >
            <input
              {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)}
            />

            <Upload className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isDragActive
                ? "Drop file Excel di sini..."
                : "Drag & drop file Excel di sini, atau klik untuk browse"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Hanya file .xlsx atau .xls, maksimal 5MB
            </p>
          </div>

          {file && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleImport}
            disabled={!file || loading}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              !file || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Memproses...
              </span>
            ) : (
              "Import Data"
            )}
          </button>
        </div>

        {result && (
          <div className="mt-8">
            <div className="flex items-center mb-6">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Hasil Import:</h3>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <UserPlus className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                  <div>
                    <p className="text-green-800 dark:text-green-300 font-medium text-sm">
                      Berhasil Ditambahkan
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {result.success}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                  <div>
                    <p className="text-blue-800 dark:text-blue-300 font-medium text-sm">
                      Diupdate
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {result.updated}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <UserMinus className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <div>
                    <p className="text-yellow-800 dark:text-yellow-300 font-medium text-sm">
                      Dilewati (Duplikat)
                    </p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {result.skipped}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" />
                  <div>
                    <p className="text-red-800 dark:text-red-300 font-medium text-sm">
                      Gagal
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {result.failed}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skip Breakdown Cards */}
            {result && result.skipBreakdown && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Alasan Skip Terperinci:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      key: "duplicates",
                      label: "Duplikat NISN",
                      color: "yellow",
                    },
                    {
                      key: "summaryRows",
                      label: "Footer/Summary",
                      color: "gray",
                    },
                    {
                      key: "classNotFound",
                      label: "Kelas Salah",
                      color: "orange",
                    },
                    { key: "missingData", label: "Data Kosong", color: "red" },
                    {
                      key: "genderInvalid",
                      label: "Gender Salah",
                      color: "purple",
                    },
                  ].map(({ key, label, color }) => (
                    <div
                      key={key}
                      className={`bg-${color}-50 dark:bg-${color}-900/20 p-4 rounded-lg`}
                    >
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {result.skipBreakdown[key] || 0}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Worksheet Details */}
            {result.worksheetDetails &&
              Object.keys(result.worksheetDetails).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Detail per Worksheet:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(result.worksheetDetails).map(
                      ([wsName, wsResult]: [string, any]) => (
                        <div
                          key={wsName}
                          className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                        >
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                            {wsName}
                          </h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Sukses:
                              </span>
                              <span className="ml-1 font-medium text-green-600 dark:text-green-400">
                                {wsResult.success}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Gagal:
                              </span>
                              <span className="ml-1 font-medium text-red-600 dark:text-red-400">
                                {wsResult.failed}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Skip:
                              </span>
                              <span className="ml-1 font-medium text-yellow-600 dark:text-yellow-400">
                                {wsResult.skipped}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Error Details */}
            {result.errors.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                  Detail Error:
                </h4>
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full divide-y divide-yellow-200 dark:divide-yellow-800">
                    <thead className="bg-yellow-100 dark:bg-yellow-900/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-yellow-800 dark:text-yellow-300 uppercase tracking-wider">
                          Worksheet
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-yellow-800 dark:text-yellow-300 uppercase tracking-wider">
                          Baris
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-yellow-800 dark:text-yellow-300 uppercase tracking-wider">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-yellow-200 dark:divide-yellow-800">
                      {result.errors.map((error: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-yellow-700 dark:text-yellow-400">
                            {error.worksheet || "-"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-yellow-700 dark:text-yellow-400">
                            {error.row}
                          </td>
                          <td className="px-4 py-2 text-sm text-yellow-700 dark:text-yellow-400">
                            {error.error}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
