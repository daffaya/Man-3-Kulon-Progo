import React from "react";
import StudentForm from "../forms/StudentForm";
import { StudentFormData } from "../../types/studentTypes";
import { studentService } from "../../services/studentService";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import { useClasses } from "../../hooks/useClasses";
import { X } from "lucide-react";

interface EditStudentModalProps {
  student: any;
  onClose: () => void;
  onSuccess: () => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();
  const { classes } = useClasses();

  const handleSubmit = async (data: StudentFormData) => {
    if (!token) {
      showErrorToast("Token tidak tersedia. Silakan login ulang.");
      return;
    }

    try {
      await studentService.updateStudent(student.id, data, token);
      showSuccessToast("Data siswa berhasil diupdate!");
      onSuccess();
    } catch (error: any) {
      console.error("Error updating student:", error);
      showErrorToast(error.message || "Gagal mengupdate siswa");
      throw error;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-student-title"
    >
      <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h3
            id="edit-student-title"
            className="text-lg font-semibold text-foreground"
          >
            Edit Siswa
          </h3>
          <button
            onClick={onClose}
            className="text-secondary hover:text-foreground p-1 rounded-full hover:bg-[rgb(var(--color-secondary-hover))] transition-colors"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>
        <StudentForm
          initialData={student}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default EditStudentModal;
