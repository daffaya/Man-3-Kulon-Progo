/**
 * @fileoverview Edit Alumni Page component for updating alumni information.
 * This component provides a form for editing alumni data, including their current status,
 * workplace, business, or university information. Basic information is displayed as read-only.
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { alumniService } from "../../services/alumniService";
import { studentService } from "../../services/studentService";

export const ALLOWED_ROLES = ["guru_bk", "super_admin"] as const;

/**
 * Interface defining the structure of alumni data.
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
  birthplace?: string;
  birthdate?: string;
  gender?: string;
  address?: string;
  phone?: string;
}

/**
 * Checks if a user has permission to edit alumni data based on their role.
 * @param {boolean} isLoggedIn - The user's login status.
 * @param {string | undefined} role - The user's role.
 * @returns {boolean} True if the user has edit access, otherwise false.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * Component for editing alumni information.
 * Displays basic alumni information as read-only and allows editing of current status,
 * workplace, business, or university information. Access is restricted to users with
 * appropriate roles (guru_bk or super_admin).
 */
const EditAlumniPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user, token } = useAuth();
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
  const [loading, setLoading] = useState(true);

  const isAdminOrGuruBK = hasEditAccess(isLoggedIn, user?.role);

  useEffect(() => {
    if (!isAdminOrGuruBK || !token || !id) {
      showErrorToast("Akses ditolak atau data tidak valid");
      navigate("/alumni");
      return;
    }

    const loadAlumniData = async () => {
      setLoading(true);
      try {
        const alumniResponse = await alumniService.getAlumni({}, token);
        const alum = alumniResponse.data.find(
          (a: Alumni) => a.id === Number(id)
        );

        if (!alum) {
          showErrorToast("Alumni tidak ditemukan");
          navigate("/alumni");
          return;
        }

        const studentResponse = await studentService.getStudents({
          token,
          search: alum.nisn,
        });
        const student = studentResponse[0];

        setFormData({
          ...alum,
          nik: student?.nik || "",
          birthplace: student?.birth_place || "",
          birthdate: student?.birth_date || "",
          gender: student?.jenis_kelamin || "",
          address: student?.address || "",
          phone: student?.phone || "",
        });
      } catch (error: any) {
        showErrorToast(error.message || "Gagal memuat data alumni");
        navigate("/alumni");
      } finally {
        setLoading(false);
      }
    };

    loadAlumniData();
  }, [id, token, isAdminOrGuruBK, navigate, showErrorToast]);

  /**
   * Handles form submission to update alumni information.
   * Only updates editable fields (status, workplace, business, university).
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;

    setLoading(true);
    try {
      await alumniService.updateAlumni(
        Number(id),
        {
          status: formData.status,
          workplace: formData.workplace,
          business: formData.business,
          university: formData.university,
        },
        token
      );
      showSuccessToast("Data alumni berhasil diperbarui");
      navigate("/alumni");
    } catch (error: any) {
      showErrorToast(error.message || "Gagal menyimpan perubahan");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="mt-4 text-secondary">Memuat data alumni...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
        <button
          onClick={() => navigate("/alumni")}
          className="text-sm text-secondary hover:text-accent flex items-center mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke Daftar Alumni
        </button>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-8">
          Edit Data Alumni
        </h1>

        <div className="card p-6 max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="md:col-span-2 space-y-4 p-5 bg-semibackground/50 rounded-lg">
              <h3 className="text-lg font-semibold text-foreground col-span-2 mb-3">
                Informasi Dasar (Tidak Dapat Diubah)
              </h3>
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

            <div className="md:col-span-2 space-y-4 p-5 bg-semibackground/30 rounded-lg">
              <h3 className="text-lg font-semibold text-foreground col-span-2 mb-3">
                Data Pribadi
              </h3>
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
                  value={formData.birthplace || "-"}
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
                  value={formData.birthdate || "-"}
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
                  value={formData.gender || "-"}
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

            <div className="md:col-span-2 space-y-4 p-5 bg-white dark:bg-semibackground rounded-lg border border-accent/20">
              <h3 className="text-lg font-semibold text-foreground col-span-2 mb-3">
                Status & Aktivitas Saat Ini
              </h3>
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
                      setFormData({ ...formData, workplace: e.target.value })
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
                      setFormData({ ...formData, university: e.target.value })
                    }
                    className="form-input w-full"
                    placeholder="Nama perguruan tinggi"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/alumni")}
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditAlumniPage;
