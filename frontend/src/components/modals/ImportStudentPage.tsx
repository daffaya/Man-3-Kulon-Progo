// src/components/modals/ImportStudentPage.tsx
import React from "react";
import { ImportForm } from "../forms/ImportForm";
import { useAuth } from "../../contexts/AuthContext";
import { AlertCircle, X } from "lucide-react";

interface ImportStudentPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ImportStudentPage: React.FC<ImportStudentPageProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  // Check if user has permission
  const hasPermission =
    user?.role === "super_admin" || user?.role === "guru_bk";

  if (!hasPermission) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Akses Ditolak
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Hanya Super Admin dan Guru BK yang dapat mengimport data siswa.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  // Modal tidak akan ditampilkan jika isOpen=false
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Import Data Siswa</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <ImportForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};

export default ImportStudentPage;
