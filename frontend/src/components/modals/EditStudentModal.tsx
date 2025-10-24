// src/components/modals/EditStudentModal.tsx
import React from "react";
import StudentForm from "../forms/StudentForm";
import { StudentFormData } from "../../types/studentTypes";
import { studentService } from "../../services/studentService";
import { useAuth } from "../../contexts/AuthContext"; // TAMBAH INI
import { useClasses } from "../../hooks/useClasses";

interface EditStudentModalProps {
  student: any;
  onClose: () => void;
  onSuccess: () => void;
  showToast?: (message: string, type?: "success" | "error" | "warning") => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  onClose,
  onSuccess,
  showToast,
}) => {
  const { token } = useAuth(); // TAMBAH INI
  const { classes } = useClasses();

  const handleSubmit = async (data: StudentFormData) => {
    if (!token) {
      showToast?.("Token tidak tersedia. Silakan login ulang.", "error");
      return;
    }

    try {
      await studentService.updateStudent(student.id, data, token);
      showToast?.("Data siswa berhasil diupdate!", "success"); // TOAST SUKSES
      onSuccess();
    } catch (error: any) {
      console.error("Error updating student:", error);
      showToast?.(`${error.message || "Gagal mengupdate siswa"}`, "error"); // TOAST ERROR
      throw error; // Re-throw untuk handle di parent
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Siswa
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ×
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
