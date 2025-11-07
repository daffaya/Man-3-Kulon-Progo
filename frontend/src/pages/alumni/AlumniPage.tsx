// frontend/src/pages/AlumniPage.tsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  LogIn,
  ArrowLeft,
  Search,
  Users,
  Calendar,
  BookOpen,
  Award,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import AdminLayout from "../../components/layout/AdminLayout";
import { useNavigate, Link } from "react-router-dom";
import Filters from "../../components/alumni/AlumniFilter";
import AlumniTable from "../../components/tables/AlumniTable";
import { alumniService } from "../../services/alumniService";
import { useToast } from "../../contexts/ToastContext";

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
  const { showToast } = useToast();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const isAdminOrGuruBK = hasEditAccess(isLoggedIn, user?.role);

  useEffect(() => {
    const loadAlumni = async () => {
      setLoading(true);
      setShowEmptyState(false);
      try {
        const data = await alumniService.getAlumni(
          { search: searchQuery, graduationYear },
          token
        );
        setAlumni(data.data);

        // Tampilkan pesan kosong jika tidak ada hasil
        if (data.data.length === 0) {
          setShowEmptyState(true);
        }
      } catch (err) {
        showToast((err as Error).message, "error");
      } finally {
        setLoading(false);
      }
    };
    loadAlumni();
  }, [searchQuery, graduationYear, token, showToast]);

  const handleEditClick = (alumni: Alumni) => {
    if (!isAdminOrGuruBK) {
      showToast("Anda tidak memiliki akses untuk mengedit alumni", "error");
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: "/alumni" } });
      }
      return;
    }
    navigate(`/admin/alumni/${alumni.id}/edit`, { state: { alumni } });
  };

  const SelectedLayout = isAdminOrGuruBK ? AdminLayout : Layout;

  // Mendapatkan tahun unik untuk filter
  const uniqueYears = [...new Set(alumni.map((a) => a.graduation_year))].sort(
    (a, b) => parseInt(b) - parseInt(a)
  );

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

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Jejak Alumni
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Temukan teman seangkatanmu dan lihat prestasi alumni MAN 3 Kulon
            Progo.
          </p>
        </div>

        {/* Statistik Alumni */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6 flex items-center">
            <div className="bg-accent/10 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Alumni
              </p>
              <p className="text-2xl font-bold">{alumni.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6 flex items-center">
            <div className="bg-accent/10 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Angkatan Terbaru
              </p>
              <p className="text-2xl font-bold">
                {uniqueYears.length > 0 ? uniqueYears[0] : "-"}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6 flex items-center">
            <div className="bg-accent/10 p-3 rounded-full mr-4">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Angkatan
              </p>
              <p className="text-2xl font-bold">{uniqueYears.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Search className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-xl font-semibold">Cari Alumni</h2>
          </div>

          <Filters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            graduationYear={graduationYear}
            setGraduationYear={setGraduationYear}
            years={uniqueYears}
          />
        </div>

        {/* Tabel Alumni atau Pesan Kosong */}
        {showEmptyState && !loading ? (
          <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-12 text-center mb-8">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Tidak ada alumni yang ditemukan
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Coba ubah filter pencarian atau kata kunci untuk menemukan alumni
              yang kamu cari.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setGraduationYear("");
              }}
              className="btn btn-secondary"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6 mb-8">
            <AlumniTable
              alumni={alumni}
              loading={loading}
              isAdminOrGuruBK={isAdminOrGuruBK}
              handleEditClick={handleEditClick}
            />
          </div>
        )}

        {!isAdminOrGuruBK && (
          <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-accent/10 p-3 rounded-full flex items-center justify-center mb-4">
              <Award className="h-10 w-10 text-accent" />
            </div>

            {isLoggedIn ? (
              <>
                <h3 className="text-xl font-semibold mb-2">
                  Ingin mengupdate data alumni?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Hanya guru BK atau super admin yang dapat mengedit data
                  alumni.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2">
                  Ingin mengupdate data alumni?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Login terlebih dahulu untuk mengedit data alumni dan terhubung
                  dengan teman-temanmu.
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
      </div>
    </SelectedLayout>
  );
};

export default AlumniPage;
