import React from "react";
import { Download, Edit, Trash, RefreshCw } from "lucide-react";
import { Archive } from "../../types/archiveTypes";
import { truncateText } from "../../lib/utils";

const formatDate = (dateString: string | null) =>
  dateString ? new Date(dateString).toLocaleDateString() : "-";

interface ArchiveTableProps {
  archives: Archive[];
  loading: boolean;
  isAdminOrArsiparis: boolean;
  handleDownload: (id: number, fileName: string) => void;
  handleEditClick: (archive: Archive) => void;
  handleDelete: (id: number) => void;
}

const ArchiveTable: React.FC<ArchiveTableProps> = ({
  archives,
  loading,
  isAdminOrArsiparis,
  handleDownload,
  handleEditClick,
  handleDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw size={40} className="mx-auto animate-spin text-accent" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat arsip...</p>
      </div>
    );
  }

  if (archives.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Tidak ada arsip yang ditemukan
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Nama File
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Kategori
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Deskripsi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Nomor Dokumen
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tanggal Dokumen
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {archives.map((archive) => (
            <tr
              key={archive.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                {truncateText(archive.file_name, 25)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {archive.category_name || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {archive.description || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {archive.document_number || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatDate(archive.document_date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() =>
                      handleDownload(archive.id, archive.file_name)
                    }
                    className="text-accent hover:text-hover dark:text-accent dark:hover:text-hover"
                    aria-label="Download archive"
                  >
                    <Download size={18} />
                  </button>
                  {isAdminOrArsiparis && (
                    <>
                      <button
                        onClick={() => handleEditClick(archive)}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        aria-label="Edit archive"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(archive.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        aria-label="Delete archive"
                      >
                        <Trash size={18} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ArchiveTable;
