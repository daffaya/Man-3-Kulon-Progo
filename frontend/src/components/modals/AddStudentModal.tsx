/**
 * @fileoverview Modal component for adding a new student.
 * This component renders a modal dialog containing the `StudentForm`.
 * It handles the form submission to create a new student, displays success
 * or error notifications, and closes the modal upon successful submission.
 */

import React from "react";
import StudentForm from "../forms/StudentForm";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import { studentService } from "../../services/studentService";
import { StudentFormData } from "../../types/studentTypes";
import { X } from "lucide-react";

/**
 * Props for the AddStudentModal component.
 * @typedef {object} AddStudentModalProps
 * @property {boolean} isOpen - Controls the visibility of the modal.
 * @property {() => void} onClose - Function to call when the modal should be closed.
 * @property {() => void} onSuccess - Callback function to execute after a student is successfully added.
 */
interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * A modal dialog component for adding a new student.
 * It wraps the `StudentForm` component and handles the logic for
 * creating a student, showing toast notifications for success or error,
 * and closing the modal on success.
 *
 * @param {AddStudentModalProps} props - The component props.
 * @returns {JSX.Element | null} The rendered modal component, or null if it should not be open.
 */
const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  if (!isOpen || !token) return null;

  // Set default values for the form
  const currentYear = new Date().getFullYear();
  const defaultAcademicYear = `${currentYear}/${currentYear + 1}`;
  const defaultAngkatan = currentYear.toString();

  // Create default form data
  const defaultFormData: StudentFormData = {
    nisn: "",
    name: "",
    class_id: 0,
    academic_year: defaultAcademicYear,
    angkatan: defaultAngkatan,
    jenis_kelamin: undefined,
    nik: "",
    birth_place: "",
    birth_date: "",
    address: "",
    phone: "",
    parent_name: "",
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-student-modal-title"
    >
      <div
        className="card p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
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
          initialData={defaultFormData}
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
