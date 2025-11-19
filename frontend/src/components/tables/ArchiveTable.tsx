/**
 * @fileoverview React component for displaying archives in a table format.
 * This component renders a table of archive items with their details and provides
 * action buttons for downloading, editing, and deleting archives based on user permissions.
 */

import React from "react";
import { Download, Edit, Trash, RefreshCw } from "lucide-react";
import { Archive } from "../../types/archiveTypes";
import { truncateText } from "../../lib/utils";

/**
 * Formats a date string into a localized date format.
 * @param {string | null} dateString - The date string to format
 * @returns {string} The formatted date or "-" if no date is provided
 */
const formatDate = (dateString: string | null) =>
  dateString ? new Date(dateString).toLocaleDateString() : "-";

/**
 * Props for the ArchiveTable component
 * @typedef {object} ArchiveTableProps
 * @property {Archive[]} archives - Array of archive objects to display
 * @property {boolean} loading - Flag indicating if archives are being loaded
 * @property {boolean} isAdminOrArsiparis - Flag indicating if user has admin or archivist permissions
 * @property {(id: number, fileName: string) => void} handleDownload - Function to handle archive download
 * @property {(archive: Archive) => void} handleEditClick - Function to handle archive editing
 * @property {(id: number) => void} handleDelete - Function to handle archive deletion
 */
interface ArchiveTableProps {
  archives: Archive[];
  loading: boolean;
  isAdminOrArsiparis: boolean;
  handleDownload: (id: number, fileName: string) => void;
  handleEditClick: (archive: Archive) => void;
  handleDelete: (id: number) => void;
}
/**
 * Component for displaying archives in a table format.
 * Shows loading state, empty state, or the table of archives based on the current state.
 * Provides action buttons for downloading, editing, and deleting archives based on user permissions.
 *
 * @param {ArchiveTableProps} props - The component props
 * @returns {JSX.Element} The rendered ArchiveTable component
 */
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
      <div className="card p-12 text-center">
        <RefreshCw size={40} className="mx-auto animate-spin text-accent" />
        <p className="mt-4 text-secondary">Memuat arsip...</p>
      </div>
    );
  }

  if (archives.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-xl text-secondary">Tidak ada arsip yang ditemukan</p>
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-800">
        <thead className="bg-[rgb(var(--color-semi-background))]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Nama File
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Kategori
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Deskripsi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Nomor Dokumen
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Tanggal Dokumen
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {archives.map((archive) => (
            <tr
              key={archive.id}
              className="hover:bg-[rgb(var(--color-secondary-hover))]"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                {truncateText(archive.file_name, 25)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                {archive.category_name || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                {archive.description || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                {archive.document_number || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                {formatDate(archive.document_date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() =>
                      handleDownload(archive.id, archive.file_name)
                    }
                    className="hover:text-hover"
                    aria-label="Download archive"
                  >
                    <Download size={18} />
                  </button>
                  {isAdminOrArsiparis && (
                    <>
                      <button
                        onClick={() => handleEditClick(archive)}
                        className="text-accent hover:text-hover"
                        aria-label="Edit archive"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(archive.id)}
                        className="text-error hover:opacity-80"
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
