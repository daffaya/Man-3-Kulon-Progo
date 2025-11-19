/**
 * @fileoverview Modal component for moving a student to a different class.
 * This component provides a form interface for selecting a new class for a student,
 * displaying current student information, and handling the API call to update the class assignment.
 */

import React, { useState } from "react";
import { studentService } from "../../services/studentService";
import { useClasses } from "../../hooks/useClasses";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import { Users } from "lucide-react";
import { Student } from "../../types/studentTypes";

/**
 * Props for the MoveClassModal component
 * @interface MoveClassModalProps
 */
interface MoveClassModalProps {
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal component for moving a student to a different class.
 * Displays current student information and provides a dropdown to select a new class.
 * Handles the API call to update the student's class assignment.
 *
 * @param {MoveClassModalProps} props - The component props
 * @returns {JSX.Element} The rendered modal component
 */
const MoveClassModal: React.FC<MoveClassModalProps> = ({
  student,
  onClose,
  onSuccess,
}) => {
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { classes } = useClasses();
  const { token } = useAuth();
  const { showSuccessToast, showErrorToast, showWarningToast } =
    useToastMessage();

  /**
   * Handles the form submission to move the student to a new class
   */
  const handleSubmit = async () => {
    if (!selectedClass) {
      showWarningToast("Silakan pilih kelas tujuan");
      return;
    }

    if (!token) {
      showErrorToast("Token tidak tersedia. Silakan login ulang.");
      return;
    }

    setLoading(true);
    try {
      await studentService.moveStudentClass(student.id, selectedClass, token);
      showSuccessToast("Siswa berhasil dipindah kelas!");
      onSuccess();
    } catch (error: any) {
      console.error("Error moving student class:", error);
      showErrorToast(error.message || "Gagal memindahkan kelas siswa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-accent mr-2" />
            <h3 className="text-lg font-semibold text-foreground">
              Pindah Kelas Siswa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-foreground transition-colors"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-secondary mb-2">
            Siswa:{" "}
            <span className="font-medium text-foreground">{student.name}</span>{" "}
            ({student.nisn})
          </p>
          <p className="text-sm text-secondary">
            Kelas saat ini:{" "}
            <span className="font-medium text-foreground">
              {student.class_name || "Belum ditetapkan"}
            </span>
          </p>
        </div>

        <div className="mb-6">
          <label
            htmlFor="targetClass"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Pilih Kelas Tujuan
          </label>
          <select
            id="targetClass"
            value={selectedClass}
            onChange={(e) => setSelectedClass(Number(e.target.value))}
            className="form-input w-full"
            disabled={loading}
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
