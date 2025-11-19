/**
 * @fileoverview AlumniTable component for displaying alumni data in a tabular format.
 * This component renders a table with alumni information and provides edit functionality for authorized users.
 */

import React from "react";

interface Alumni {
  id: number;
  nisn: string;
  name: string;
  graduation_year: string;
  last_class_name: string;
}

interface AlumniTableProps {
  alumni: Alumni[];
  loading: boolean;
  isAdminOrGuruBK: boolean;
  handleEditClick: (alumni: Alumni) => void;
}

/**
 * AlumniTable component that displays alumni information in a table format.
 * Shows a loading spinner while data is being fetched and provides an edit button
 * for users with admin or Guru BK privileges.
 *
 * @param {AlumniTableProps} props - The component props
 * @returns {JSX.Element} The rendered table component
 */
const AlumniTable: React.FC<AlumniTableProps> = ({
  alumni,
  loading,
  isAdminOrGuruBK,
  handleEditClick,
}) => {
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
