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

const AlumniTable: React.FC<AlumniTableProps> = ({
  alumni,
  loading,
  isAdminOrGuruBK,
  handleEditClick,
}) => {
  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Memuat data alumni...
          </p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">NISN</th>
              <th className="text-left py-3 px-4">Nama</th>
              <th className="text-left py-3 px-4">Tahun Lulus</th>
              <th className="text-left py-3 px-4">Kelas Terakhir</th>
              {isAdminOrGuruBK && <th className="text-left py-3 px-4">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {alumni.map((alum) => (
              <tr key={alum.id} className="border-b">
                <td className="py-3 px-4">{alum.nisn}</td>
                <td className="py-3 px-4">{alum.name}</td>
                <td className="py-3 px-4">{alum.graduation_year}</td>
                <td className="py-3 px-4">{alum.last_class_name || "-"}</td>
                {isAdminOrGuruBK && (
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEditClick(alum)}
                      className="text-blue-600 hover:underline"
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
