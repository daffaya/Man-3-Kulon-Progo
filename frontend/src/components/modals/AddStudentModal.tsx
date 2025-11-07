import React from "react";
import StudentForm from "../forms/StudentForm";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import { studentService } from "../../services/studentService";
import { X } from "lucide-react";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  if (!isOpen || !token) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-student-modal-title"
    >
      <div className="card p-6 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h3
            id="add-student-modal-title"
            className="text-lg font-semibold text-foreground"
          >
            Tambah Siswa Baru
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
          onSubmit={async (data) => {
            try {
              await studentService.createStudent(data, token);
              showSuccessToast("Siswa berhasil ditambahkan!");
              onSuccess();
              onClose();
            } catch (error: any) {
              console.error("Error creating student:", error);
              showErrorToast(error.message || "Gagal menambah siswa");
            }
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default AddStudentModal;
