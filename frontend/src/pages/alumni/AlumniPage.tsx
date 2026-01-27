/**
 * @fileoverview Page component for managing and viewing alumni information.
 * This component handles the retrieval, searching, filtering, and display of alumni records.
 * It includes role-based conditional rendering for administrative actions, pagination controls,
 * and a modal interface for editing alumni details.
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  LogIn,
  ArrowLeft,
  Search,
  Users,
  Calendar,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import AdminLayout from "../../components/layout/AdminLayout";
import { useNavigate, Link } from "react-router-dom";
import Filters from "../../components/alumni/AlumniFilter";
import AlumniTable from "../../components/tables/AlumniTable";
import EditAlumniModal from "../../components/modals/EditAlumniModal";
import { alumniApi } from "../../api/alumniApi";
import { useToast } from "../../contexts/ToastContext";

export const ALLOWED_ROLES = ["guru_bk", "super_admin"] as const;

/**
 * Represents an Alumni record.
 */
interface Alumni {
  id: number;
  nisn: string;
  name: string;
  graduation_year: string;
  last_class_name: string;
  status?: string;
}

/**
 * Structure for pagination metadata.
 */
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalAlumni: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Determines if the current user has edit access based on login status and role.
 * @param {boolean} isLoggedIn - Whether the user is logged in.
 * @param {string} [role] - The user's role.
 * @returns {boolean} True if the user has edit access, false otherwise.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * AlumniPage component that displays a list of alumni with search and filter capabilities.
 * Supports role-based editing and pagination.
 */
const AlumniPage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAlumniId, setSelectedAlumniId] = useState<number | null>(null);
  const alumniPerPage = 20;

  const isAdminOrGuruBK = hasEditAccess(isLoggedIn, user?.role);

  useEffect(() => {
    const loadAlumni = async () => {
      setLoading(true);
      setShowEmptyState(false);
      try {
        const data = await alumniApi.getAlumni(
          {
            search: searchQuery,
            graduationYear,
            page: currentPage,
            limit: alumniPerPage,
          },
          token,
        );
        setAlumni(data.data);
        setPagination(data.pagination);

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
  }, [searchQuery, graduationYear, currentPage, token, showToast]);

  /**
   * Handles the edit button click event.
   * Checks permissions and opens the edit modal if authorized.
   * @param {Alumni} alumni - The alumni record to edit.
   */
  const handleEditClick = (alumni: Alumni) => {
    if (!isAdminOrGuruBK) {
      showToast("Anda tidak memiliki akses untuk mengedit alumni", "error");
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: "/alumni" } });
      }
      return;
    }
    setSelectedAlumniId(alumni.id);
    setIsEditModalOpen(true);
  };

  /**
   * Updates the alumni list state when a record is successfully edited.
   * @param {Alumni} updatedAlumni - The updated alumni object.
   */
  const handleAlumniUpdate = (updatedAlumni: Alumni) => {
    setAlumni((prevAlumni) =>
      prevAlumni.map((alum) =>
        alum.id === updatedAlumni.id ? updatedAlumni : alum,
      ),
    );
  };

  /**
   * Closes the edit modal and resets the selected alumni ID.
   */
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedAlumniId(null);
  };

  /**
   * Handles changes to the current page number.
   * @param {number} page - The new page number.
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  /**
   * Resets the current page to 1 when filters change.
   */
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const SelectedLayout = isAdminOrGuruBK ? AdminLayout : Layout;

  const uniqueYears = [...new Set(alumni.map((a) => a.graduation_year))].sort(
    (a, b) => parseInt(b) - parseInt(a),
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card p-6 flex items-center">
            <div className="p-3 rounded-full bg-accent/10 mr-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-secondary">Total Alumni</p>
              <p className="text-2xl font-bold text-foreground">
                {pagination ? pagination.totalAlumni : alumni.length}
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
            onFilterChange={handleFilterChange}
          />
        </div>

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
                setCurrentPage(1);
              }}
              className="btn btn-secondary"
            >
              Reset Filter
            </button>
          </div>
        )}

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

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center mt-12">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`btn btn-secondary px-4 py-2 flex items-center ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeft size={20} />
                <span className="ml-1">Sebelumnya</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <span className="px-3 py-2 text-secondary/60">
                            ...
                          </span>
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              currentPage === page
                                ? "btn btn-primary"
                                : "btn btn-secondary"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          currentPage === page
                            ? "btn btn-primary"
                            : "btn btn-secondary"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className={`btn btn-secondary px-4 py-2 flex items-center ${
                  currentPage === pagination.totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <span className="mr-1">Berikutnya</span>
                <ChevronRight size={20} />
              </button>
            </nav>
          </div>
        )}

        {pagination && (
          <div className="text-center mt-4 text-sm text-secondary/70">
            Menampilkan {alumni.length} dari {pagination.totalAlumni} alumni
            {pagination.totalPages > 1 && (
              <span>
                {" "}
                (Halaman {currentPage} dari {pagination.totalPages})
              </span>
            )}
          </div>
        )}

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

        <EditAlumniModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          alumniId={selectedAlumniId}
          onUpdate={handleAlumniUpdate}
        />
      </div>
    </SelectedLayout>
  );
};

export default AlumniPage;
