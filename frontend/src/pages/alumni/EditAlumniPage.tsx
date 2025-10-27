import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { alumniService } from "../../services/alumniService";
import { studentService } from "../../services/studentService";
import Toast from "../../components/ui/Toast";
import { v4 as uuidv4 } from "uuid";

export const API_URL = import.meta.env.VITE_BACKEND_API_URL;
export const ALLOWED_ROLES = ["guru_bk", "super_admin"] as const;

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

const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

const EditAlumniPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { isLoggedIn, user, token } = useAuth();
  const [formData, setFormData] = useState<Alumni>({
    id: 0,
    student_id: 0,
    nisn: "",
    name: "",
    graduation_year: "",
    last_class_name: "",
    last_academic_year: "",
  });
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: "success" | "error" }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const isAdminOrGuruBK = hasEditAccess(isLoggedIn, user?.role);

  const addToast = (message: string, type: "success" | "error") => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    if (!isAdminOrGuruBK) {
      addToast("Anda tidak memiliki akses untuk mengedit alumni", "error");
      navigate("/alumni");
      return;
    }

    if (id && token) {
      setLoading(true);
      alumniService
        .getAlumni({}, token)
        .then((data) => {
          const alum = data.data.find((a: Alumni) => a.id === Number(id));
          if (alum) {
            studentService
              .getStudents({ token, search: alum.nisn })
              .then((studentData) => {
                const student = studentData[0];
                if (student) {
                  setFormData({
                    ...alum,
                    nik: student.nik || "",
                    birthplace: student.birth_place || "",
                    birthdate: student.birth_date || "",
                    gender: student.jenis_kelamin || "",
                    address: student.address || "",
                    phone: student.phone || "",
                  });
                } else {
                  addToast("Data siswa tidak ditemukan", "error");
                  navigate("/alumni");
                }
              })
              .catch((error) => {
                addToast(error.message || "Gagal memuat data siswa", "error");
                navigate("/alumni");
              });
          } else {
            addToast("Alumni tidak ditemukan", "error");
            navigate("/alumni");
          }
        })
        .catch((error) => {
          addToast(error.message || "Gagal memuat data alumni", "error");
          navigate("/alumni");
        })
        .finally(() => setLoading(false));
    }
  }, [id, token, navigate, isAdminOrGuruBK]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      addToast("Token tidak ditemukan", "error");
      return;
    }
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
      addToast("Data alumni berhasil diperbarui", "success");
      navigate("/alumni");
    } catch (error: any) {
      addToast(error.message || "Gagal memperbarui data alumni", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
        <button
          onClick={() => navigate("/alumni")}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary flex items-center mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke Daftar Alumni
        </button>
        <h1 className="text-3xl font-serif font-bold mb-6">Edit Data Alumni</h1>
        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Memuat data...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md">
              <div className="mb-4">
                <label className="block text-sm font-medium">NISN</label>
                <input
                  type="text"
                  value={formData.nisn}
                  disabled
                  className="form-input w-full bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Nama</label>
                <input
                  type="text"
                  value={formData.name}
                  disabled
                  className="form-input w-full bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Tahun Lulus</label>
                <input
                  type="text"
                  value={formData.graduation_year}
                  disabled
                  className="form-input w-full bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Kelas Terakhir
                </label>
                <input
                  type="text"
                  value={formData.last_class_name || ""}
                  disabled
                  className="form-input w-full bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">NIK</label>
                <input
                  type="text"
                  value={formData.nik || ""}
                  disabled
                  className="form-input w-full bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={formData.birthplace || ""}
                  disabled
                  className="form-input w-full bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Tanggal Lahir
                </label>
                <input
                  type="text"
                  value={formData.birthdate || ""}
                  disabled
                  className="form-input w-full bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Jenis Kelamin
                </label>
                <input
                  type="text"
                  value={formData.gender || ""}
                  disabled
                  className="form-input w-full bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Alamat</label>
                <input
                  type="text"
                  value={formData.address || ""}
                  disabled
                  className="form-input w-full bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">No Telepon</label>
                <input
                  type="text"
                  value={formData.phone || ""}
                  disabled
                  className="form-input w-full bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Status</label>
                <select
                  value={formData.status || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="form-input w-full"
                >
                  <option value="">Pilih Status</option>
                  <option value="Bekerja">Bekerja</option>
                  <option value="Usaha">Usaha</option>
                  <option value="Kuliah">Kuliah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Tempat Kerja
                </label>
                <input
                  type="text"
                  value={formData.workplace || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, workplace: e.target.value })
                  }
                  className="form-input w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Usaha</label>
                <input
                  type="text"
                  value={formData.business || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, business: e.target.value })
                  }
                  className="form-input w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Universitas</label>
                <input
                  type="text"
                  value={formData.university || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, university: e.target.value })
                  }
                  className="form-input w-full"
                />
              </div>
              <div className="flex justify-end space-x-4">
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
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          )}
        </div>
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isVisible={true}
            onClose={() => removeToast(toast.id)}
            index={index}
          />
        ))}
      </div>
    </AdminLayout>
  );
};

export default EditAlumniPage;
