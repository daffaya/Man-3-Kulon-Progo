/**
 * @fileoverview Modal component for editing alumni information.
 * This component provides a form within a modal overlay for updating alumni data,
 * including their current status, workplace, business, or university information.
 * Basic information and personal data are displayed as read-only.
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import { alumniApi } from "../../api/alumniApi";
import { studentService } from "../../services/studentService";
import { X } from "lucide-react";

/**
 * Represents an Alumni record.
 */
interface Alumni {
  id: number;
  student_id: number;
  nisn: string;
  name: string;
  graduation_year: string;
  last_class_name: string;
  last_academic_year: string;
  status?: string;
  workplace?: string;
  business?: string;
  university?: string;
  nik?: string;
  birth_place?: string;
  birth_date?: string;
  jenis_kelamin?: "L" | "P";
  address?: string;
  phone?: string;
}

/**
 * Props for the EditAlumniModal component.
 */
interface EditAlumniModalProps {
  /** Flag indicating if the modal is currently open. */
  isOpen: boolean;
  /** Callback function to close the modal. */
  onClose: () => void;
  /** The ID of the alumni being edited. */
  alumniId: number | null;
  /** Callback function invoked when alumni data is successfully updated. */
  onUpdate: (updatedAlumni: Alumni) => void;
}

/**
 * Helper function to format date from database to display format.
 * @param {string | Date | null | undefined} dateValue - The date value from the database.
 * @returns {string} The formatted date string or "-" if invalid.
 */
const formatDateForDisplay = (
  dateValue: string | Date | null | undefined,
): string => {
  if (!dateValue) return "-";

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return "-";
  }
};

/**
 * Helper function to format gender for display.
 * @param {"L" | "P" | undefined} gender - The gender value from the database.
 * @returns {string} The formatted gender string or "-" if invalid.
 */
const formatGender = (gender?: "L" | "P"): string => {
  if (!gender) return "-";
  return gender === "L" ? "Laki-laki" : gender === "P" ? "Perempuan" : gender;
};

/**
 * EditAlumniModal component that provides a form within a modal to edit alumni data.
 * It displays basic alumni information and personal data as read-only, and allows
 * editing of current status, workplace, business, or university information.
 *
 * @param {EditAlumniModalProps} props - The component props.
 * @returns {JSX.Element} The rendered modal component.
 */
const EditAlumniModal: React.FC<EditAlumniModalProps> = ({
  isOpen,
  onClose,
  alumniId,
  onUpdate,
}) => {
  const { token } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();
  const [formData, setFormData] = useState<Alumni>({
    id: 0,
    student_id: 0,
    nisn: "",
    name: "",
    graduation_year: "",
    last_class_name: "",
    last_academic_year: "",
  });
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && alumniId && token) {
      loadAlumniData();
    }
  }, [isOpen, alumniId, token]);

  /**
   * Loads alumni and associated student data from the API.
   * @async
   */
  const loadAlumniData = async () => {
    if (!alumniId || !token) return;

    setLoading(true);
    try {
      const alumniResponse = await alumniApi.getAlumni({}, token);
      const alum = alumniResponse.data.find((a: Alumni) => a.id === alumniId);

      if (!alum) {
        showErrorToast("Alumni tidak ditemukan");
        onClose();
        return;
      }

      try {
        const student = await studentService.getStudentByNISN(alum.nisn, token);
        setStudentData(student);

        setFormData({
          ...alum,
          nik: student?.nik || "",
          birth_place: student?.birth_place || "",
          birth_date: student?.birth_date || "",
          jenis_kelamin: student?.jenis_kelamin || "",
          address: student?.address || "",
          phone: student?.phone || "",
        });
      } catch (studentError) {
        setFormData({
          ...alum,
          nik: "",
          birth_place: "",
          birth_date: "",
          jenis_kelamin: undefined,
          address: "",
          phone: "",
        });
      }
    } catch (error: any) {
      showErrorToast(error.message || "Gagal memuat data alumni");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form submission to update alumni information.
   * @async
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !alumniId) return;

    setLoading(true);
    try {
      const updatedData = await alumniApi.updateAlumni(
        alumniId,
        {
          status: formData.status,
          workplace: formData.workplace,
          business: formData.business,
          university: formData.university,
        },
        token,
      );

      showSuccessToast("Data alumni berhasil diperbarui");
      onUpdate({ ...formData, ...updatedData });
      onClose();
    } catch (error: any) {
      showErrorToast(error.message || "Gagal menyimpan perubahan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-alumni-modal-title"
    >
      <div
        className="card p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3
            id="edit-alumni-modal-title"
            className="text-xl font-semibold text-foreground"
          >
            Edit Data Alumni
          </h3>
          <button
            onClick={onClose}
            className="text-secondary hover:text-foreground p-1 rounded-full hover:bg-[rgb(var(--color-secondary-hover))] transition-colors"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            <p className="mt-4 text-secondary">Memuat data alumni...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information Section */}
              <div className="md:col-span-2 space-y-4 p-5 bg-semibackground/50 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground col-span-2 mb-3">
                  Informasi Dasar (Tidak Dapat Diubah)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary">
                      NISN
                    </label>
                    <input
                      type="text"
                      value={formData.nisn}
                      disabled
                      className="form-input w-full bg-semibackground text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary">
                      Nama
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      disabled
                      className="form-input w-full bg-semibackground text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary">
                      Tahun Lulus
                    </label>
                    <input
                      type="text"
                      value={formData.graduation_year}
                      disabled
                      className="form-input w-full bg-semibackground text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary">
                      Kelas Terakhir
                    </label>
                    <input
                      type="text"
                      value={formData.last_class_name || "-"}
                      disabled
                      className="form-input w-full bg-semibackground text-secondary"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Data Section */}
              <div className="md:col-span-2 space-y-4 p-5 bg-semibackground/30 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground col-span-2 mb-3">
                  Data Pribadi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary">
                      NIK
                    </label>
                    <input
                      type="text"
                      value={formData.nik || "-"}
                      disabled
                      className="form-input w-full bg-semibackground text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary">
                      Tempat Lahir
                    </label>
                    <input
                      type="text"
                      value={formData.birth_place || "-"}
                      disabled
                      className="form-input w-full bg-semibackground text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary">
                      Tanggal Lahir
                    </label>
                    <input
                      type="text"
                      value={formatDateForDisplay(formData.birth_date)}
                      disabled
                      className="form-input w-full bg-semibackground text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary">
                      Jenis Kelamin
                    </label>
                    <input
                      type="text"
                      value={formatGender(formData.jenis_kelamin)}
                      disabled
                      className="form-input w-full bg-semibackground text-secondary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary">
                      Alamat
                    </label>
                    <input
                      type="text"
                      value={formData.address || "-"}
                      disabled
                      className="form-input w-full bg-semibackground text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary">
                      No. Telepon
                    </label>
                    <input
                      type="text"
                      value={formData.phone || "-"}
                      disabled
                      className="form-input w-full bg-semibackground text-secondary"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Activities Section */}
              <div className="md:col-span-2 space-y-4 p-5 bg-white dark:bg-semibackground rounded-lg border border-accent/20">
                <h3 className="text-lg font-semibold text-foreground col-span-2 mb-3">
                  Status & Aktivitas Saat Ini
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Status
                    </label>
                    <select
                      value={formData.status || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="form-input w-full"
                      required
                    >
                      <option value="">Pilih Status</option>
                      <option value="Bekerja">Bekerja</option>
                      <option value="Usaha">Berwirausaha</option>
                      <option value="Kuliah">Kuliah</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  {formData.status === "Bekerja" && (
                    <div>
                      <label className="block text-sm font-medium text-foreground">
                        Tempat Kerja
                      </label>
                      <input
                        type="text"
                        value={formData.workplace || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workplace: e.target.value,
                          })
                        }
                        className="form-input w-full"
                        placeholder="Nama perusahaan/instansi"
                      />
                    </div>
                  )}

                  {formData.status === "Usaha" && (
                    <div>
                      <label className="block text-sm font-medium text-foreground">
                        Nama Usaha
                      </label>
                      <input
                        type="text"
                        value={formData.business || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, business: e.target.value })
                        }
                        className="form-input w-full"
                        placeholder="Jenis usaha atau nama bisnis"
                      />
                    </div>
                  )}

                  {formData.status === "Kuliah" && (
                    <div>
                      <label className="block text-sm font-medium text-foreground">
                        Universitas
                      </label>
                      <input
                        type="text"
                        value={formData.university || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            university: e.target.value,
                          })
                        }
                        className="form-input w-full"
                        placeholder="Nama perguruan tinggi"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditAlumniModal;
