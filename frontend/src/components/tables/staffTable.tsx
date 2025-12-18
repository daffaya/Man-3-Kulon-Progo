/**
 * @fileoverview Table component for displaying a list of staff members in the admin panel.
 * Responsive table with mobile-first layout.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, RefreshCw } from "lucide-react";
import { Staff } from "../../types/staffTypes";

/** Props for the StaffTable component */
interface StaffTableProps {
  staff: Staff[];
  onDelete: (id: number) => void;
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
}

/** Badge displaying staff type (Guru / Staf) */
const TypeBadge: React.FC<{ staff: Staff }> = ({ staff }) => (
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

/** Action buttons */
const ActionButtons: React.FC<{
  staff: Staff;
  onDelete: (id: number) => void;
}> = ({ staff, onDelete }) => (
  <div className="flex justify-end space-x-2">
    <Link
      to={`/atmin/staff/${staff.id}/edit`}
      className="text-accent hover:text-hover transition-colors"
      title="Edit staff"
    >
      <Edit size={18} />
    </Link>
    <button
      onClick={() => onDelete(staff.id)}
      className="text-error hover:text-error/80 transition-colors"
      title="Hapus staff"
    >
      <Trash2 size={18} />
    </button>
  </div>
);

const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  onDelete,
  loading,
  currentPage,
  itemsPerPage,
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-zinc-800 min-h-[200px] flex items-center justify-center relative">
        <RefreshCw size={40} className="animate-spin text-accent" />
        <p className="absolute bottom-4 text-secondary text-sm">
          Memuat data staff...
        </p>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-secondary">
          Tidak ada data staff.
        </h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="min-w-full table-fixed divide-y divide-zinc-800">
        <thead className="bg-semibackground">
          <tr>
            {/* No */}
            <th className="px-2 py-3 w-10 text-center text-xs font-medium text-secondary uppercase">
              No
            </th>

            {/* Nama */}
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase">
              Nama
            </th>

            {/* NIP */}
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase hidden sm:table-cell">
              NIP
            </th>

            {/* Tipe */}
            <th className="px-2 py-3 text-center text-xs font-medium text-secondary uppercase hidden sm:table-cell whitespace-nowrap w-fit">
              Tipe
            </th>

            {/* Gender */}
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase hidden md:table-cell">
              Gender
            </th>

            {/* Status */}
            <th className="px-2 py-3 text-center text-xs font-medium text-secondary uppercase hidden md:table-cell whitespace-nowrap w-fit">
              Status
            </th>

            {/* Jabatan */}
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase hidden lg:table-cell w-fit">
              Jabatan
            </th>

            {/* Aksi */}
            <th className="px-2 py-3 text-center text-xs font-medium text-secondary uppercase whitespace-nowrap w-fit">
              Aksi
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-800">
          {staff.map((item, index) => (
            <tr
              key={item.id}
              className="hover:bg-semibackground transition-colors"
            >
              {/* No */}
              <td className="px-2 py-4 w-10 text-center text-sm text-secondary whitespace-nowrap">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </td>

              {/* Nama + mobile info */}
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-foreground">
                  {item.nama}
                </div>

                <div className="sm:hidden mt-1 flex flex-wrap gap-2 text-xs text-secondary">
                  <TypeBadge staff={item} />
                  <span>• {item.nip}</span>
                </div>
              </td>

              {/* NIP */}
              <td className="px-4 py-4 text-sm text-secondary hidden sm:table-cell">
                {item.nip}
              </td>

              {/* Tipe */}
              <td className="px-2 py-4 text-center hidden sm:table-cell whitespace-nowrap">
                <TypeBadge staff={item} />
              </td>

              {/* Gender */}
              <td className="px-4 py-4 text-sm text-secondary hidden md:table-cell">
                {item.gender === "L" ? "Laki-laki" : "Perempuan"}
              </td>

              {/* Status */}
              <td className="px-2 py-4 text-center text-sm text-secondary hidden md:table-cell whitespace-nowrap">
                {item.status}
              </td>

              {/* Jabatan */}
              <td className="px-4 py-4 text-sm text-secondary hidden lg:table-cell">
                {item.jabatan}
              </td>

              {/* Aksi */}
              <td className="px-2 py-4 text-right whitespace-nowrap">
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
