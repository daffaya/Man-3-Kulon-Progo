/**
 * @fileoverview Modal component for editing an existing student's information.
 * This component renders a form within a modal overlay, allowing administrators to update student details.
 * It handles form submission, displays success/error notifications, and manages the modal's open/close state.
 */

import React, { useEffect } from "react";
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

/**
 * Helper function to format date from database to HTML date input format (YYYY-MM-DD)
 * @param {string|Date} dateValue - The date value from the database
 * @returns {string} The formatted date string or empty string if invalid
 */
const formatDateForInput = (
  dateValue: string | Date | null | undefined,
): string => {
  if (!dateValue) return "";

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    return "";
  }
};

/**
 * EditStudentModal component that provides a form within a modal to edit student data.
 * It uses the StudentForm component for the form fields and handles the submission logic
 * to update the student data via the studentService.
 *
 * @param {EditStudentModalProps} props - The component props.
 * @returns {JSX.Element} The rendered modal component.
 */
const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();
  const { classes } = useClasses();
  const [studentData, setStudentData] = React.useState<any>(null);

  useEffect(() => {
    const formattedBirthDate = formatDateForInput(student.birth_date);

    const mappedData: StudentFormData = {
      nisn: student.nisn || "",
      name: student.name || "",
      jenis_kelamin: student.jenis_kelamin || undefined,
      class_id: student.class_id || 0,
      academic_year: student.academic_year || "",
      nik: student.nik || "",
      birth_place: student.birth_place || "",
      birth_date: formattedBirthDate,
      address: student.address || "",
      phone: student.phone || "",
      parent_name: student.parent_name || "",
      angkatan: student.angkatan || "",
    };

    setStudentData(mappedData);
  }, [student]);

  /**
   * Handles the form submission to update a student.
   * Calls the student service, shows appropriate toast notifications, and triggers the success callback.
   * @param {StudentFormData} data - The updated student data from the form.
   */
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
      showErrorToast(error.message || "Gagal mengupdate siswa");
      throw error;
    }
  };

  if (!studentData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="card p-6 w-full max-w-md">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-student-modal-title"
    >
      <div
        className="card p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
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
          initialData={studentData}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default EditStudentModal;
