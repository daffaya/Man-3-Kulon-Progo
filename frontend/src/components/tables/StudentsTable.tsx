// src/components/tables/StudentsTable.tsx
import React from "react";
import { Student } from "../../types/studentTypes";
import { Edit, Trash2, Users } from "lucide-react";

interface StudentsTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: number) => void;
  onMoveClass: (student: Student) => void;
  canEditClasses: boolean;
}

const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  onEdit,
  onDelete,
  onMoveClass,
  canEditClasses,
}) => {
  const getStatusBadge = (isActive: boolean) => (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {isActive ? "Aktif" : "Tidak Aktif"}
    </span>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              NISN
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Nama
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Kelas
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Tahun Ajaran
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {students.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
              >
                Tidak ada data siswa
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {student.nisn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {student.class_name || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {student.academic_year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getStatusBadge(student.is_active)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(student)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Edit siswa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onDelete(student.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Hapus siswa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {canEditClasses && (
                      <button
                        onClick={() => onMoveClass(student)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
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
