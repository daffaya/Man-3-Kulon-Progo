/**
 * @fileoverview React component for displaying a table of alumni.
 * This component handles the presentation of alumni data, including NISN, name,
 * graduation year, last class, and current status. It supports loading states,
 * role-based visibility for edit actions, and dynamic styling for status badges.
 */

import React from "react";

/**
 * Props for the AlumniTable component.
 */
interface AlumniTableProps {
  alumni: Alumni[];
  loading: boolean;
  isAdminOrGuruBK: boolean;
  handleEditClick: (alumni: Alumni) => void;
}

/**
 * Represents an Alumni record.
 */
interface Alumni {
  id: number;
  nisn: string;
  name: string;
  graduation_year: string;
  last_class_name: string;
  status?: string;
}

/**
 * A table component for displaying and managing alumni information.
 * It supports loading states, role-based actions, and status badge visualization.
 *
 * @param {AlumniTableProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered table component.
 */
const AlumniTable: React.FC<AlumniTableProps> = ({
  alumni,
  loading,
  isAdminOrGuruBK,
  handleEditClick,
}) => {
  /**
   * Returns a styled badge based on the alumni's status.
   * @param {string} status - The status of the alumnus.
   * @returns {JSX.Element} The styled status badge.
   */
  const getStatusBadge = (status?: string) => {
    if (!status) return <span className="text-gray-500">-</span>;

    let badgeClass = "px-2 py-1 text-xs rounded-full ";

    switch (status) {
      case "Bekerja":
        badgeClass +=
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        break;
      case "Usaha":
        badgeClass +=
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        break;
      case "Kuliah":
        badgeClass +=
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
        break;
      case "Lainnya":
        badgeClass +=
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
        break;
      default:
        badgeClass +=
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }

    return <span className={badgeClass}>{status}</span>;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-secondary">Memuat data alumni...</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-semibackground">
            <tr className="border-b border-zinc-800">
              <th className="text-left py-3 px-4 font-medium text-secondary">
                No
              </th>
              <th className="text-left py-3 px-4 font-medium text-secondary">
                NISN
              </th>
              <th className="text-left py-3 px-4 font-medium text-secondary">
                Nama
              </th>
              <th className="text-left py-3 px-4 font-medium text-secondary">
                Tahun Lulus
              </th>
              <th className="text-left py-3 px-4 font-medium text-secondary">
                Kelas Terakhir
              </th>
              <th className="text-left py-3 px-4 font-medium text-secondary">
                Status
              </th>
              {isAdminOrGuruBK && (
                <th className="text-left py-3 px-4 font-medium text-secondary">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {alumni.map((alum, index) => (
              <tr
                key={alum.id}
                className="hover:bg-semibackground transition-colors"
              >
                <td className="py-3 px-4 text-foreground">{index + 1}</td>
                <td className="py-3 px-4 text-foreground">{alum.nisn}</td>
                <td className="py-3 px-4 text-foreground">{alum.name}</td>
                <td className="py-3 px-4 text-foreground">
                  {alum.graduation_year}
                </td>
                <td className="py-3 px-4 text-foreground">
                  {alum.last_class_name || "-"}
                </td>
                <td className="py-3 px-4 text-foreground">
                  {getStatusBadge(alum.status)}
                </td>
                {isAdminOrGuruBK && (
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEditClick(alum)}
                      className="text-accent hover:text-hover transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AlumniTable;
