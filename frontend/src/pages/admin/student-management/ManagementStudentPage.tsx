/**
 * @fileoverview Page component for managing student data within the admin panel.
 * It provides functionalities for viewing, searching, filtering, adding, editing, deleting, and bulk-updating student records.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AdminLayout from "../../../components/layout/AdminLayout";
import { useStudents } from "../../../hooks/useStudents";
import { useClasses } from "../../../hooks/useClasses";
import { useAngkatans } from "../../../hooks/useAngkatans";
import StudentTable from "../../../components/tables/StudentsTable";
import AddStudentModal from "../../../components/modals/AddStudentModal";
import EditStudentModal from "../../../components/modals/EditStudentModal";
import MoveClassModal from "../../../components/modals/MoveClassModal";
import ImportStudentPage from "../../../components/modals/ImportStudentPage";
import BulkMoveClassModal from "../../../components/modals/BulkMoveClassModal";
import {
  Search,
  Plus,
  Filter,
  Upload,
  Users,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

/**
 * Component for the student management page.
 * It handles fetching, displaying, and modifying student data through a table interface and various modal dialogs.
 */
const ManagementStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, token, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [selectedAngkatan, setSelectedAngkatan] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [moveStudent, setMoveStudent] = useState<any>(null);
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 30;

  const {
    students,
    loading,
    error,
    pagination,
    addStudent: _addStudent,
    updateStudent: _updateStudent,
    deleteStudent: _deleteStudent,
    refetch,
  } = useStudents({
    token: token || "",
    classId: selectedClass || undefined,
    search: searchTerm || undefined,
    angkatan: selectedAngkatan || undefined,
    page: currentPage,
    limit: studentsPerPage,
  });

  const { classes } = useClasses();
  const { angkatans, loading: angkatansLoading } = useAngkatans();

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, selectedAngkatan, searchTerm]);

  if (isLoadingAuth) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="mt-4 text-secondary">Memeriksa autentikasi...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!isLoggedIn) {
    navigate("/login", { state: { redirectTo: "/atmin/presensi/students" } });
    return null;
  }

  const hasEditAccess = ["guru_bk", "super_admin"].includes(user?.role || "");
  const canEditClasses = user?.role === "super_admin";

  if (!hasEditAccess) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="card p-12 text-center max-w-md mx-auto">
            <Users className="h-16 w-16 text-secondary/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Akses Ditolak
            </h3>
            <p className="text-secondary">
              Hanya Guru BK dan Super Admin yang dapat mengakses halaman ini.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  /**
   * Wraps the `addStudent` hook function to add a new student and display a success or error toast notification.
   * @param {any} data - The student data to be added.
   */
  const addStudent = async (data: any) => {
    try {
      await _addStudent(data);
      showSuccessToast("Siswa berhasil ditambahkan!");
    } catch (err: any) {
      showErrorToast(err.message || "Gagal menambah siswa");
      throw err;
    }
  };

  /**
   * Wraps the `updateStudent` hook function to modify an existing student's data and display a toast notification.
   * @param {number} id - The ID of the student to be updated.
   * @param {any} data - The updated student data.
   */
  const updateStudent = async (id: number, data: any) => {
    try {
      await _updateStudent(id, data);
      showSuccessToast("Data siswa berhasil diperbarui!");
    } catch (err: any) {
      showErrorToast(err.message || "Gagal mengupdate siswa");
      throw err;
    }
  };

  /**
   * Handles the deletion of a student after a confirmation prompt and displays a toast notification.
   * @param {number} id - The ID of the student to be deleted.
   */
  const deleteStudent = async (id: number) => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus siswa ini? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      return;
    }
    try {
      await _deleteStudent(id);
      showSuccessToast("Siswa berhasil dihapus!");
    } catch (err: any) {
      showErrorToast(err.message || "Gagal menghapus siswa");
    }
  };

  /**
   * Navigates to the previous page of the student list.
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  /**
   * Navigates to the next page of the student list.
   */
  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/atmin/presensi")}
              className="text-sm text-secondary hover:text-accent flex items-center mr-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </button>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Manajemen Siswa
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-secondary flex items-center"
            >
              <Upload className="h-5 w-5 mr-2" />
              Import
            </button>
            <button
              onClick={() => setShowBulkMoveModal(true)}
              className="btn btn-secondary flex items-center"
            >
              <Users className="h-5 w-5 mr-2" />
              Naik Kelas
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Tambah Siswa
            </button>
          </div>
        </div>

        <div className="card p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
              <input
                type="text"
                placeholder="Cari NISN atau nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full pl-10"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(Number(e.target.value))}
                className="form-input w-full pl-10 appearance-none"
              >
                <option value={0}>Semua Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.academic_year})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary">
                Total:{" "}
                <strong>{pagination?.totalItems ?? students.length}</strong>{" "}
                siswa
              </span>
              <button
                onClick={refetch}
                className="text-accent hover:text-accent-dark flex items-center"
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="card p-4 mb-6 border border-error/20 bg-error/5">
            <p className="text-error font-medium">{error}</p>
            {error.includes("token") && (
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                className="mt-2 text-sm text-error hover:underline"
              >
                Login ulang
              </button>
            )}
          </div>
        )}

        <div className="card p-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-accent animate-spin mx-auto mb-3" />
              <p className="text-secondary">Memuat data siswa...</p>
            </div>
          ) : (
            <>
              <StudentTable
                students={students}
                onEdit={setEditStudent}
                onDelete={deleteStudent}
                onMoveClass={setMoveStudent}
                canEditClasses={canEditClasses}
                loading={loading}
                currentPage={currentPage}
                itemsPerPage={studentsPerPage}
              />

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="btn btn-secondary text-sm"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm text-secondary">
                    Halaman <strong>{currentPage}</strong> dari{" "}
                    <strong>{pagination.totalPages}</strong>
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === pagination.totalPages}
                    className="btn btn-secondary text-sm"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
        />

        <ImportStudentPage
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            refetch();
          }}
        />

        {editStudent && (
          <EditStudentModal
            student={editStudent}
            onClose={() => setEditStudent(null)}
            onSuccess={() => {
              setEditStudent(null);
              refetch();
            }}
          />
        )}

        {moveStudent && (
          <MoveClassModal
            student={moveStudent}
            onClose={() => setMoveStudent(null)}
            onSuccess={() => {
              setMoveStudent(null);
              refetch();
            }}
          />
        )}

        {showBulkMoveModal && (
          <BulkMoveClassModal
            isOpen={true}
            onClose={() => setShowBulkMoveModal(false)}
            onSuccess={() => {
              setShowBulkMoveModal(false);
              refetch();
            }}
            classes={classes}
            angkatans={angkatans}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ManagementStudentPage;
