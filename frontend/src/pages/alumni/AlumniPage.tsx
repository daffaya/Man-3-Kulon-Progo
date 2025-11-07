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
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import AdminLayout from "../../components/layout/AdminLayout";
import { useNavigate, Link } from "react-router-dom";
import Filters from "../../components/alumni/AlumniFilter";
import AlumniTable from "../../components/tables/AlumniTable";
import { alumniService } from "../../services/alumniService";
import { useToast } from "../../contexts/ToastContext";

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
    navigate(`/atmin/alumni/${alumni.id}/edit`, { state: { alumni } });
  };

  const SelectedLayout = isAdminOrGuruBK ? AdminLayout : Layout;

  const uniqueYears = [...new Set(alumni.map((a) => a.graduation_year))].sort(
    (a, b) => parseInt(b) - parseInt(a)
  );

  return (
    <SelectedLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
        {isAdminOrGuruBK && (
          <Link
            to="/atmin"
            className="text-sm text-secondary hover:text-accent flex items-center mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke dashboard admin
          </Link>
        )}

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 text-foreground">
            Jejak Alumni
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Temukan teman seangkatan dan kenang masa indah di MAN 3 Kulon Progo.
          </p>
        </div>

        {/* Statistik Alumni */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card p-6 flex items-center">
            <div className="p-3 rounded-full bg-accent/10 mr-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-secondary">Total Alumni</p>
              <p className="text-2xl font-bold text-foreground">
                {alumni.length}
              </p>
            </div>
          </div>

          <div className="card p-6 flex items-center">
            <div className="p-3 rounded-full bg-accent/10 mr-4">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-secondary">Angkatan Terbaru</p>
              <p className="text-2xl font-bold text-foreground">
                {uniqueYears.length > 0 ? uniqueYears[0] : "-"}
              </p>
            </div>
          </div>

          <div className="card p-6 flex items-center">
            <div className="p-3 rounded-full bg-accent/10 mr-4">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-secondary">Total Angkatan</p>
              <p className="text-2xl font-bold text-foreground">
                {uniqueYears.length}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="card p-6 mb-8">
          <div className="flex items-center mb-5">
            <Search className="h-5 w-5 text-secondary mr-2" />
            <h2 className="text-xl font-semibold text-foreground">
              Cari Alumni
            </h2>
          </div>

          <Filters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            graduationYear={graduationYear}
            setGraduationYear={setGraduationYear}
            years={uniqueYears}
          />
        </div>

        {/* Empty State */}
        {showEmptyState && !loading && (
          <div className="card p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-semibackground rounded-full flex items-center justify-center mb-5">
              <Search className="h-12 w-12 text-secondary/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Tidak ada alumni yang ditemukan
            </h3>
            <p className="text-secondary mb-5 max-w-md mx-auto">
              Coba ubah kata kunci atau filter angkatan untuk hasil yang lebih
              luas.
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
        )}

        {/* Alumni Table */}
        {!showEmptyState && (
          <div className="card p-6">
            <AlumniTable
              alumni={alumni}
              loading={loading}
              isAdminOrGuruBK={isAdminOrGuruBK}
              handleEditClick={handleEditClick}
            />
          </div>
        )}

        {/* Access Info */}
        {!isAdminOrGuruBK && (
          <div className="card p-8 text-center mt-10">
            <div className="mx-auto w-16 h-16 bg-accent/10 p-3 rounded-full flex items-center justify-center mb-5">
              <Users className="h-10 w-10 text-accent" />
            </div>

            {isLoggedIn ? (
              <>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Ingin mengelola data alumni?
                </h3>
                <p className="text-secondary mb-4">
                  Hanya guru BK atau super admin yang dapat mengedit dan
                  mengelola data alumni.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Login untuk mengelola data alumni
                </h3>
                <p className="text-secondary mb-5">
                  Akses penuh untuk mengedit dan menambahkan data alumni
                  tersedia setelah login.
                </p>
                <button
                  onClick={() =>
                    navigate("/login", { state: { redirectTo: "/alumni" } })
                  }
                  className="btn btn-primary flex items-center mx-auto w-fit"
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
