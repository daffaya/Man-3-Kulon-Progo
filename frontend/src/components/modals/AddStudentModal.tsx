// src/components/modals/AddStudentModal.tsx
import React from "react";
import StudentForm from "../forms/StudentForm";
import { useAuth } from "../../contexts/AuthContext";

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

  if (!isOpen || !token) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Tambah Siswa Baru</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <StudentForm
          onSubmit={async (data) => {
            try {
              const { studentService } = await import(
                "../../services/studentService"
              );
              await studentService.createStudent(data, token);
              onSuccess();
              onClose();
            } catch (error) {
              console.error("Error creating student:", error);
            }
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default AddStudentModal;
