import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LogIn, ArrowLeft } from "lucide-react";
import Layout from "../../components/layout/Layout";
import AdminLayout from "../../components/layout/AdminLayout";
import { useNavigate, Link } from "react-router-dom";
import Filters from "../../components/alumni/AlumniFilter";
import AlumniTable from "../../components/tables/AlumniTable";
import { alumniService } from "../../services/alumniService";
import Toast from "../../components/ui/Toast";
import { v4 as uuidv4 } from "uuid";

export const API_URL = import.meta.env.VITE_BACKEND_API_URL;
export const ALLOWED_ROLES = ["guru_bk", "super_admin"] as const;

interface Alumni {
  id: number;
  nisn: string;
  name: string;
  graduation_year: string;
  last_class_name: string;
}

const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

const AlumniPage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
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
    const loadAlumni = async () => {
      setLoading(true);
      try {
        const data = await alumniService.getAlumni(
          { search: searchQuery, graduationYear },
          token
        );
        setAlumni(data.data);
      } catch (err) {
        addToast((err as Error).message, "error");
      } finally {
        setLoading(false);
      }
    };
    loadAlumni();
  }, [searchQuery, graduationYear, token]);

  const handleEditClick = (alumni: Alumni) => {
    if (!isAdminOrGuruBK) {
      addToast("Anda tidak memiliki akses untuk mengedit alumni", "error");
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: "/alumni" } });
      }
      return;
    }
    navigate(`/admin/alumni/${alumni.id}/edit`, { state: { alumni } });
  };

  const SelectedLayout = isAdminOrGuruBK ? AdminLayout : Layout;

  return (
    <SelectedLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
        {isAdminOrGuruBK && (
          <Link
            to="/admin"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary flex items-center mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke admin dashboard
          </Link>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4 sm:mb-0">
            Daftar Alumni
          </h1>
        </div>
        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          <Filters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            graduationYear={graduationYear}
            setGraduationYear={setGraduationYear}
            years={[...new Set(alumni.map((a) => a.graduation_year))]}
          />
          <AlumniTable
            alumni={alumni}
            loading={loading}
            isAdminOrGuruBK={isAdminOrGuruBK}
            handleEditClick={handleEditClick}
          />
        </div>
        {!isAdminOrGuruBK && (
          <div className="mt-8 text-center">
            {isLoggedIn ? (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Hanya guru BK atau super admin yang dapat mengedit alumni.
              </p>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Silakan login untuk mengedit alumni.
                </p>
                <button
                  onClick={() =>
                    navigate("/login", { state: { redirectTo: "/alumni" } })
                  }
                  className="btn btn-primary flex items-center justify-center mx-auto w-fit"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Login Sekarang
                </button>
              </>
            )}
          </div>
        )}
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
    </SelectedLayout>
  );
};

export default AlumniPage;
