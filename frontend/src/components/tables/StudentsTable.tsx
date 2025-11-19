/**
 * @fileoverview StudentsTable component for displaying student data in a tabular format.
 * This component renders a table with student information and provides action buttons for editing,
 * deleting, and moving students between classes based on user permissions.
 */

import React from "react";
import { Student } from "../../types/studentTypes";
import { Edit, Trash2, Users, RefreshCw } from "lucide-react";

interface StudentsTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: number) => void;
  onMoveClass: (student: Student) => void;
  canEditClasses: boolean;
  loading?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
}

/**
 * StudentsTable component that displays student information in a table format.
 * Shows a loading spinner while data is being fetched and provides action buttons
 * for editing, deleting, and moving students between classes based on permissions.
 *
 * @param {StudentsTableProps} props - The component props
 * @returns {JSX.Element} The rendered table component
 */
const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  onEdit,
  onDelete,
  onMoveClass,
  canEditClasses,
  loading = false,
  currentPage = 1,
  itemsPerPage = 30,
}) => {
  /**
   * Returns a status badge component based on the active status of a student
   * @param {boolean} isActive - Whether the student is active
   * @returns {JSX.Element} The status badge component
   */
  const getStatusBadge = (isActive: boolean) => (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        isActive
          ? "bg-[rgb(var(--color-success),0.1)] text-[rgb(var(--color-success))]"
          : "bg-[rgb(var(--color-error),0.1)] text-[rgb(var(--color-error))]"
      }`}
    >
      {isActive ? "Aktif" : "Tidak Aktif"}
    </span>
  );

  if (loading) {
    return (
      <div className="card p-8 min-h-[200px] flex flex-col items-center justify-center">
        <RefreshCw
          size={40}
          className="animate-spin text-[rgb(var(--color-accent))]"
        />
        <p className="mt-4 text-secondary">Memuat data siswa...</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <table className="min-w-full divide-y divide-zinc-800">
        <thead className="bg-[rgb(var(--color-semi-background))]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              No
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              NISN
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Nama
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Kelas
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Angkatan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {students.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-secondary">
                Tidak ada data siswa
              </td>
            </tr>
          ) : (
            students.map((student, index) => (
              <tr
                key={student.id}
                className="hover:bg-[rgb(var(--color-secondary-hover))]"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  {student.nisn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {student.class_name || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {student.angkatan || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getStatusBadge(student.is_active)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(student)}
                      className="text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-hover))]"
                      title="Edit siswa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onDelete(student.id)}
                      className="text-[rgb(var(--color-error))] hover:opacity-80"
                      title="Hapus siswa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {canEditClasses && (
                      <button
                        onClick={() => onMoveClass(student)}
                        className="text-[rgb(var(--color-success))] hover:opacity-80"
                        title="Pindah kelas"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsTable;
