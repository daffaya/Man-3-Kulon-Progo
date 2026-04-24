/**
 * @fileoverview PmbmTable component for displaying PMBM registration data in a tabular format.
 * This component renders a table with registration summary information and provides
 * action buttons for viewing details of each record.
 */

import React from "react";
import { Eye, RefreshCw } from "lucide-react";
import type { PmbmRegistrationSummary } from "../../types/pmbmTypes";
import { JALUR_LABEL, STATUS_LABEL } from "../../types/pmbmTypes";

/**
 * Props for the PmbmTable component.
 */
interface PmbmTableProps {
  /** List of registration summary records to display. */
  registrations: PmbmRegistrationSummary[];
  /** Callback fired when the detail button is clicked for a record. */
  onDetail: (registration: PmbmRegistrationSummary) => void;
  /** Whether the table data is currently loading. */
  loading?: boolean;
  /** Current page number for row numbering offset. */
  currentPage?: number;
  /** Number of items per page for row numbering offset. */
  itemsPerPage?: number;
}

/**
 * Returns a styled badge element for the given registration status.
 * @param {string} status - The registration status value.
 * @returns {JSX.Element} The rendered status badge.
 */
const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    verified:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    accepted:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    withdrawn:
      "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        styles[status] ?? "bg-secondary/10 text-secondary"
      }`}
    >
      {STATUS_LABEL[status as keyof typeof STATUS_LABEL] ?? status}
    </span>
  );
};

/**
 * PmbmTable component that displays PMBM registration records in a table format.
 * Shows a loading spinner while data is being fetched and an empty state when
 * no records match the current filters.
 *
 * @param {PmbmTableProps} props - The component props.
 * @returns {JSX.Element} The rendered table component.
 */
const PmbmTable: React.FC<PmbmTableProps> = ({
  registrations,
  onDetail,
  loading = false,
  currentPage = 1,
  itemsPerPage = 20,
}) => {
  if (loading) {
    return (
      <div className="p-8 min-h-[200px] flex flex-col items-center justify-center">
        <RefreshCw size={40} className="animate-spin text-accent" />
        <p className="mt-4 text-secondary">Memuat data pendaftar...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-800">
        <thead className="bg-[rgb(var(--color-semi-background))]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              No
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Nomor Pendaftaran
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Gelombang
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Nama Lengkap
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              NISN
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Jalur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Asal Sekolah
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Tanggal Daftar
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {registrations.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-6 py-8 text-center text-secondary">
                Tidak ada data pendaftar
              </td>
            </tr>
          ) : (
            registrations.map((reg, index) => (
              <tr
                key={reg.id}
                className="hover:bg-[rgb(var(--color-secondary-hover))]"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent">
                  {reg.nomor_pendaftaran}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-center">
                  {reg.gelombang}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {reg.nama_lengkap}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {reg.nisn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {JALUR_LABEL[reg.jalur] ?? reg.jalur}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {reg.asal_sekolah}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getStatusBadge(reg.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {new Date(reg.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onDetail(reg)}
                    className="text-accent hover:opacity-80 transition-opacity"
                    title="Lihat detail"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PmbmTable;
