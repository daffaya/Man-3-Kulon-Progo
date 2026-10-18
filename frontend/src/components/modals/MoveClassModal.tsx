/**
 * @fileoverview Modal for changing a student's class membership.
 * Two actions: transfer to another class of the same grade level on an
 * effective date (guru BK / super admin), and mark the student as having left
 * school (super admin only). Moving up a grade and graduation are handled by
 * the new academic year wizard, not here.
 */

import React, { useState } from "react";
import { format } from "date-fns";
import { studentService } from "../../services/studentService";
import { useClasses } from "../../hooks/useClasses";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import { Users } from "lucide-react";
import { Student } from "../../types/studentTypes";

interface MoveClassModalProps {
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = "transfer" | "leave";

/** "XI-A" -> "XI" (grade part of a class name). */
const gradeOf = (className?: string | null) =>
  (className || "").split("-")[0].trim().toUpperCase();

const MoveClassModal: React.FC<MoveClassModalProps> = ({
  student,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<Mode>("transfer");
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [effectiveDate, setEffectiveDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { classes } = useClasses();
  const { token, user } = useAuth();
  const { showSuccessToast, showErrorToast, showWarningToast } =
    useToastMessage();

  const isSuperAdmin = user?.role === "super_admin";
  const currentGrade = gradeOf(student.class_name);
  const candidates = classes.filter(
    (cls) => cls.id !== student.class_id && gradeOf(cls.name) === currentGrade,
  );

  const handleSubmit = async () => {
    if (!token) {
      showErrorToast("Token tidak tersedia. Silakan login ulang.");
      return;
    }
    if (!effectiveDate) {
      showWarningToast("Tanggal efektif wajib diisi");
      return;
    }

    setLoading(true);
    try {
      if (mode === "transfer") {
        if (!selectedClass) {
          showWarningToast("Silakan pilih kelas tujuan");
          return;
        }
        await studentService.transferStudent(
          student.id,
          { toClassId: selectedClass, effectiveDate },
          token,
        );
        showSuccessToast("Siswa berhasil dipindah kelas!");
      } else {
        if (!reason.trim()) {
          showWarningToast("Alasan wajib diisi");
          return;
        }
        await studentService.leaveStudent(
          student.id,
          { effectiveDate, reason: reason.trim() },
          token,
        );
        showSuccessToast("Siswa ditandai keluar dari sekolah");
      }
      onSuccess();
    } catch (error: any) {
      console.error("Error updating student class:", error);
      showErrorToast(error.message || "Gagal memperbarui data siswa");
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
              {mode === "transfer" ? "Pindah Kelas Siswa" : "Siswa Keluar"}
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

        {isSuperAdmin && (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setMode("transfer")}
              className={`btn flex-1 ${mode === "transfer" ? "btn-primary" : "btn-secondary"}`}
            >
              Pindah kelas
            </button>
            <button
              type="button"
              onClick={() => setMode("leave")}
              className={`btn flex-1 ${mode === "leave" ? "btn-primary" : "btn-secondary"}`}
            >
              Keluar sekolah
            </button>
          </div>
        )}

        {mode === "transfer" && (
          <div className="mb-4">
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
              {candidates.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.academic_year})
                </option>
              ))}
            </select>
            <p className="text-xs text-secondary mt-1">
              Hanya kelas dengan tingkat yang sama pada tahun ajaran berjalan.
              Kenaikan kelas dilakukan lewat menu Tahun Ajaran Baru.
            </p>
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="effectiveDate"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Tanggal Berlaku
          </label>
          <input
            id="effectiveDate"
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className="form-input w-full"
            disabled={loading}
          />
          {mode === "transfer" && (
            <p className="text-xs text-secondary mt-1">
              Presensi sebelum tanggal ini tetap tercatat di kelas lama.
            </p>
          )}
        </div>

        {mode === "leave" && (
          <div className="mb-4">
            <label
              htmlFor="leaveReason"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Alasan
            </label>
            <input
              id="leaveReason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-input w-full"
              placeholder="Contoh: pindah sekolah"
              disabled={loading}
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
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
            disabled={
              loading ||
              (mode === "transfer" ? !selectedClass : !reason.trim())
            }
          >
            {loading
              ? "Menyimpan..."
              : mode === "transfer"
                ? "Pindahkan"
                : "Tandai Keluar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveClassModal;
