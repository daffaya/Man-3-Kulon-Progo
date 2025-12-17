/**
 * @fileoverview React component for displaying staff data in a table format.
 * This component provides a table view of staff with type badges, and action buttons
 * for editing and deleting staff. It includes loading and empty states.
 */

import React from "react";
import { Edit, Trash2, RefreshCw } from "lucide-react";
import { Staff } from "../../types/staffTypes";
import { formatDate } from "../../lib/utils";

/**
 * Props for the StaffTable component
 * @interface StaffTableProps
 */
interface StaffTableProps {
  staff: Staff[];
  onDelete: (id: number) => void;
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
}

/**
 * Props for the TypeBadge component
 * @interface TypeBadgeProps
 */
interface TypeBadgeProps {
  staff: Staff;
}

/**
 * Badge component to display staff type (teacher or staff).
 *
 * @param {TypeBadgeProps} props - The component props
 * @returns {JSX.Element} The rendered type badge
 */
const TypeBadge: React.FC<TypeBadgeProps> = ({ staff }) => (
  <span
    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
      staff.type === "teacher"
        ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
        : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
    }`}
  >
    {staff.type === "teacher" ? "Guru" : "Staf"}
  </span>
);

/**
 * Props for the ActionButtons component
 * @interface ActionButtonsProps
 */
interface ActionButtonsProps {
  staff: Staff;
  onDelete: (id: number) => void;
}

/**
 * Action buttons component for each staff row.
 * Provides buttons to edit and delete a staff.
 *
 * @param {ActionButtonsProps} props - The component props
 * @returns {JSX.Element} The rendered action buttons
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({ staff, onDelete }) => {
  return (
    <div className="flex justify-end space-x-2">
      <button
        onClick={() => {
          // This will be handled by the parent component
          window.location.href = `/atmin/staff/${staff.id}/edit`;
        }}
        className="text-accent hover:text-hover transition-colors"
        aria-label="Edit staff"
        title="Edit staff"
      >
        <Edit size={18} />
      </button>

      <button
        onClick={() => onDelete(staff.id)}
        className="text-error hover:text-error/80 transition-colors"
        aria-label="Delete staff"
        title="Delete staff"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

/**
 * Table component for displaying a list of staff in the admin interface.
 * Shows staff details including name, NIP, type, gender, status, position, and action buttons.
 * Handles loading and empty states.
 *
 * @param {StaffTableProps} props - The component props
 * @returns {JSX.Element} The rendered staff table
 */
const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  onDelete,
  loading,
  currentPage,
  itemsPerPage,
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-zinc-800 relative min-h-[200px] flex items-center justify-center">
        <RefreshCw size={40} className="animate-spin text-accent" />
        <p className="mt-4 text-secondary absolute bottom-4">
          Loading staff data...
        </p>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-secondary">
          No staff found matching filters.
        </h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800 relative">
      <table className="min-w-full divide-y divide-zinc-800">
        <thead className="bg-semibackground">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider w-1/12">
              No
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider w-1/4">
              Nama
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider w-1/6">
              NIP
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider w-1/12 hidden sm:table-cell">
              Tipe
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider w-1/12 hidden sm:table-cell">
              Gender
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider w-1/6 hidden md:table-cell">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider w-1/5 hidden lg:table-cell">
              Jabatan
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider w-1/12">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {staff.map((item, index) => (
            <tr
              key={item.id}
              className="hover:bg-semibackground transition-colors"
            >
              <td className="px-4 py-4 whitespace-nowrap text-sm text-secondary">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-foreground">
                  {item.nama}
                </div>
                <div className="text-xs text-secondary sm:hidden">
                  <TypeBadge staff={item} />
                </div>
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm text-secondary">
                {item.nip}
              </td>

              <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                <TypeBadge staff={item} />
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm text-secondary hidden sm:table-cell">
                {item.gender}
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm text-secondary hidden md:table-cell">
                {item.status}
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm text-secondary hidden lg:table-cell">
                {item.jabatan}
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <ActionButtons staff={item} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTable;
