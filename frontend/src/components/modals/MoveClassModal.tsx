import React, { useState } from "react";
import { studentService } from "../../services/studentService";
import { useClasses } from "../../hooks/useClasses";
import { Users } from "lucide-react";
import { Student } from "../../types/studentTypes";

interface MoveClassModalProps {
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}

const MoveClassModal: React.FC<MoveClassModalProps> = ({
  student,
  onClose,
  onSuccess,
}) => {
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { classes } = useClasses();

  const handleSubmit = async () => {
    if (!selectedClass) {
      alert("Silakan pilih kelas tujuan");
      return;
    }

    setLoading(true);
    try {
      await studentService.moveStudentClass(student.id, selectedClass);
      onSuccess();
    } catch (error) {
      console.error("Error moving student class:", error);
      alert("Gagal memindahkan kelas siswa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pindah Kelas Siswa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Siswa: <span className="font-medium">{student.name}</span> (
            {student.nisn})
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Kelas saat ini:{" "}
            <span className="font-medium">
              {student.class_name || "Belum ditetapkan"}
            </span>
          </p>
        </div>

        <div className="mb-6">
          <label
            htmlFor="targetClass"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Pilih Kelas Tujuan
          </label>
          <select
            id="targetClass"
            value={selectedClass}
            onChange={(e) => setSelectedClass(Number(e.target.value))}
            className="form-input w-full"
          >
            <option value={0}>Pilih Kelas</option>
            {classes
              .filter((cls) => cls.id !== student.class_id)
              .map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.academic_year})
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading || !selectedClass}
          >
            {loading ? "Memindahkan..." : "Pindahkan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveClassModal;
