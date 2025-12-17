/**
 * @fileoverview Staff Management Page component for the admin panel.
 * This component provides a comprehensive interface for managing staff data, including viewing,
 * filtering, searching, paginating, and deleting staff. It includes functionality for filtering
 * by type, gender, status, and keywords. The component also handles pagination
 * and displays appropriate states for loading, empty results, and confirmation dialogs.
 */

import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Plus, RefreshCw, X, ArrowLeft } from "lucide-react";
import StaffTable from "../../../components/tables/staffTable";
import { useStaff } from "../../../contexts/staffContext";
import { useAuth } from "../../../contexts/AuthContext";
import { StaffFilters } from "../../../types/staffTypes";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AdminLayout from "../../../components/layout/AdminLayout";

interface AppliedFilters {
  keyword?: string;
  type?: string;
  gender?: string;
  status?: string;
}

export const ALLOWED_ROLES = ["super_admin"] as const;

/**
 * Checks if a user has permission to manage staff based on their login status and role.
 * @param {boolean} isLoggedIn - The user's login status.
 * @param {string | undefined} role - The user's role.
 * @returns {boolean} True if the user has management access, otherwise false.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * A page component for managing staff in the admin panel.
 * It provides functionality to view, filter, paginate, and delete staff.
 * The component handles authentication and authorization checks, ensuring only users
 * with appropriate roles can access the staff management features.
 */
const StaffManagementPage: React.FC = () => {
  const { state, deleteStaff, fetchStaffList } = useStaff();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <Navigate to="/login" state={{ redirectTo: "/atmin/staff" }} replace />
    );
  }

  const isAdmin = hasEditAccess(isLoggedIn, user?.role);

  if (!isAdmin) {
    return <Navigate to="/atmin" replace />;
  }

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<number | null>(null);

  const [keyword, setKeyword] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const staffPerPage = 10;
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      const filtersWithPagination: StaffFilters = {
        ...appliedFilters,
        page: currentPage,
        limit: staffPerPage,
      };

      fetchStaffList(filtersWithPagination);
    }
  }, [
    appliedFilters,
    currentPage,
    staffPerPage,
    isLoggedIn,
    isAdmin,
    fetchStaffList,
  ]);

  useEffect(() => {
    handleApplyFilters();
  }, [debouncedKeyword, selectedType, selectedGender, selectedStatus]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (state.pagination && currentPage < state.pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleApplyFilters = useCallback(() => {
    const filtersToApply: AppliedFilters = {
      keyword:
        debouncedKeyword.trim() !== "" ? debouncedKeyword.trim() : undefined,
      type: selectedType !== "all" ? selectedType : undefined,
      gender: selectedGender !== "all" ? selectedGender : undefined,
      status: selectedStatus !== "all" ? selectedStatus : undefined,
    };

    setAppliedFilters(filtersToApply);
    setCurrentPage(1);
  }, [debouncedKeyword, selectedType, selectedGender, selectedStatus]);

  const handleRemoveFilters = useCallback(() => {
    setKeyword("");
    setSelectedType("all");
    setSelectedGender("all");
    setSelectedStatus("all");
  }, []);

  const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleKeywordInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyFilters();
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGender(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (id: number) => {
    setStaffToDelete(id);
    setShowConfirmation(true);
  };

  const confirmDelete = useCallback(async () => {
    if (staffToDelete) {
      try {
        await deleteStaff(staffToDelete);
        const filtersWithPagination = {
          ...appliedFilters,
          page: currentPage,
          limit: staffPerPage,
        };
        fetchStaffList(filtersWithPagination);
        setShowConfirmation(false);
        setStaffToDelete(null);

        showSuccessToast("Data berhasil dihapus");
      } catch (error) {
        showErrorToast("Gagal menghapus data");
        console.error("Error deleting staff:", error);
      }
    }
  }, [
    staffToDelete,
    deleteStaff,
    fetchStaffList,
    appliedFilters,
    currentPage,
    staffPerPage,
    showSuccessToast,
    showErrorToast,
  ]);

  const cancelDelete = () => {
    setShowConfirmation(false);
    setStaffToDelete(null);
  };

  const staffToDisplay = state.staffList;
  const hasActiveFilters =
    appliedFilters.keyword ||
    appliedFilters.type ||
    appliedFilters.gender ||
    appliedFilters.status;

  if (!state.loading && staffToDisplay.length === 0 && hasActiveFilters) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="card p-12">
            <p className="text-xl text-secondary">
              Tidak ada data yang cocok dengan filter.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleRemoveFilters}
                className="mt-4 text-accent hover:underline flex items-center justify-center mx-auto"
              >
                <X size={16} className="mr-1" /> Hapus Filter
              </button>
            )}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!state.loading && staffToDisplay.length === 0 && !hasActiveFilters) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="card p-12">
            <p className="text-xl text-secondary">
              Belum ada data guru dan staf.
            </p>
            <Link
              to="/atmin/staff/new"
              className="mt-4 inline-block btn btn-primary flex items-center justify-center mx-auto w-fit"
            >
              <Plus size={18} className="mr-1" /> Tambah Data Pertama
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const isPreviousDisabled = state.loading || state.pagination.currentPage <= 1;
  const isNextDisabled =
    state.loading ||
    state.pagination.currentPage >= state.pagination.totalPages;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <Link
          to="/atmin"
          className="text-sm text-secondary hover:text-accent flex items-center mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke admin dashboard
        </Link>
        <div className="flex flex-col mx-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4 sm:mb-0 text-foreground">
            Manajemen Guru & Staf
          </h1>

          <div className="flex space-x-2">
            <Link
              to="/atmin/staff/new"
              className="btn btn-primary flex items-center"
            >
              <Plus size={18} className="mr-1" /> Tambah Data
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            {hasActiveFilters && (
              <button
                onClick={handleRemoveFilters}
                className="btn btn-secondary py-1 text-sm"
              >
                Hapus Filter
              </button>
            )}
          </div>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="keyword"
                className="block text-sm font-medium mb-1 text-foreground"
              >
                Cari Kata Kunci{" "}
                <span className="text-xs text-secondary">(Tekan Enter)</span>
              </label>

              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={handleKeywordInputChange}
                onKeyPress={handleKeywordInputKeyPress}
                placeholder="Cari nama, NIP, jabatan..."
                className="form-input w-full"
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium mb-1 text-foreground"
              >
                Tipe
              </label>
              <select
                id="type"
                value={selectedType}
                onChange={handleTypeChange}
                className="form-input w-full"
              >
                <option value="all">Semua</option>
                <option value="teacher">Guru</option>
                <option value="staff">Staf</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium mb-1 text-foreground"
              >
                Jenis Kelamin
              </label>
              <select
                id="gender"
                value={selectedGender}
                onChange={handleGenderChange}
                className="form-input w-full"
              >
                <option value="all">Semua</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium mb-1 text-foreground"
              >
                Status Kepegawaian
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={handleStatusChange}
                className="form-input w-full"
              >
                <option value="all">Semua</option>
                <option value="PNS">PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="CPNS">CPNS</option>
              </select>
            </div>
          </div>
          {state.loading ? (
            <div className="text-center py-12">
              <RefreshCw
                size={32}
                className="mx-auto animate-spin text-accent"
              />
              <p className="mt-4 text-secondary">Memuat data...</p>
            </div>
          ) : (
            <StaffTable
              staff={staffToDisplay}
              onDelete={handleDeleteClick}
              loading={state.loading}
              currentPage={currentPage}
              itemsPerPage={staffPerPage}
            />
          )}
          {state.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center mt-6">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={isPreviousDisabled}
                  className={`btn btn-secondary px-4 py-2 flex items-center ${
                    isPreviousDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="mr-1">Sebelumnya</span>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: state.pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === state.pagination.totalPages ||
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
                  onClick={handleNextPage}
                  disabled={isNextDisabled}
                  className={`btn btn-secondary px-4 py-2 flex items-center ${
                    isNextDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="ml-1">Berikutnya</span>
                </button>
              </nav>
            </div>
          )}
          {state.pagination && (
            <div className="text-center mt-4 text-sm text-secondary/70">
              Menampilkan {staffToDisplay.length} dari {state.pagination.total}{" "}
              data
              {state.pagination.totalPages > 1 && (
                <span>
                  {" "}
                  (Halaman {state.pagination.currentPage} dari{" "}
                  {state.pagination.totalPages})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-foreground">
              Konfirmasi Hapus
            </h3>
            <p className="mb-6 text-secondary">
              Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-4">
              <button onClick={cancelDelete} className="btn btn-secondary">
                Batal
              </button>
              <button onClick={confirmDelete} className="btn btn-danger">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default StaffManagementPage;
