// src/pages/admin/student-management/ManagementStudentPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import AdminLayout from "../../../components/layout/AdminLayout";
import Toast from "../../../components/ui/Toast";
import { useStudents } from "../../../hooks/useStudents";
import { useClasses } from "../../../hooks/useClasses";
import StudentTable from "../../../components/tables/StudentsTable";
import AddStudentModal from "../../../components/modals/AddStudentModal";
import EditStudentModal from "../../../components/modals/EditStudentModal";
import MoveClassModal from "../../../components/modals/MoveClassModal";
import ImportStudentPage from "../../../components/modals/ImportStudentPage";
import BulkMoveClassModal from "../../../components/modals/BulkMoveClassModal";
import { Search, Plus, Filter, Upload, Users, RefreshCw } from "lucide-react";
import { useAngkatans } from "../../../hooks/useAngkatans";

const ManagementStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, token, isLoadingAuth } = useAuth();

  // TOAST STATE
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">(
    "success"
  );
  const [showToast, setShowToast] = useState(false);

  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [selectedAngkatan, setSelectedAngkatan] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [moveStudent, setMoveStudent] = useState<any>(null);
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 30; // Maksimal 30 siswa per halaman

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

  // TOAST FUNCTION
  const showToastHandler = (
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  // WRAPPER FUNCTIONS DENGAN TOAST
  const addStudent = async (data: any) => {
    try {
      await _addStudent(data);
      showToastHandler("✅ Siswa berhasil ditambahkan!", "success");
    } catch (error: any) {
      showToastHandler(
        `❌ ${error.message || "Gagal menambah siswa"}`,
        "error"
      );
      throw error;
    }
  };

  const updateStudent = async (id: number, data: any) => {
    try {
      await _updateStudent(id, data);
      showToastHandler("✅ Data siswa berhasil diupdate!", "success");
    } catch (error: any) {
      showToastHandler(
        `❌ ${error.message || "Gagal mengupdate siswa"}`,
        "error"
      );
      throw error;
    }
  };

  const deleteStudent = async (id: number) => {
    try {
      await _deleteStudent(id);
      showToastHandler("✅ Siswa berhasil dihapus!", "success");
    } catch (error: any) {
      showToastHandler(
        `❌ ${error.message || "Gagal menghapus siswa"}`,
        "error"
      );
      throw error;
    }
  };

  // UPDATED handleDeleteStudent
  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      return;
    }
    await deleteStudent(id);
  };

  // PAGINATION HANDLERS
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, selectedAngkatan, searchTerm]);

  // Auth checks (sama)
  if (isLoadingAuth) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Memeriksa autentikasi...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  const hasEditAccess =
    isLoggedIn && ["guru_bk", "super_admin"].includes(user?.role || "");
  const canEditClasses = isLoggedIn && user?.role === "super_admin";

  if (!hasEditAccess) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Akses Ditolak
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Hanya Guru BK dan Super Admin yang dapat mengakses halaman ini.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header - sama */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/atmin/presensi")}
              className="mr-4 text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent"
            >
              ← Kembali
            </button>
            <h1 className="text-3xl font-bold">Manajemen Siswa</h1>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-secondary flex items-center"
            >
              <Upload className="mr-2 h-5 w-5" />
              Import Data
            </button>
            <button
              onClick={() => setShowBulkMoveModal(true)}
              className="btn btn-secondary flex items-center"
            >
              <Users className="mr-2 h-5 w-5" />
              Naik Kelas
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Tambah Siswa
            </button>
          </div>
        </div>

        {/* Filters - sama */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cari berdasarkan NISN atau nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-input w-full"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(Number(e.target.value))}
                className="pl-10 form-input w-full appearance-none"
              >
                <option value={0}>Semua Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.academic_year})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total: {pagination?.totalItems || students.length} siswa
              </span>
              <button
                onClick={refetch}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Display - sama */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">
              Error:
            </h3>
            <p className="text-red-700 dark:text-red-400">{error}</p>
            {error.includes("token") && (
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Login Ulang
              </button>
            )}
          </div>
        )}

        {/* Students Table with Pagination */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw
                size={32}
                className="mx-auto animate-spin text-accent"
              />
              <p className="mt-4">Memuat data siswa...</p>
            </div>
          ) : (
            <>
              <StudentTable
                students={students}
                onEdit={(student) => setEditStudent(student)}
                onDelete={handleDeleteStudent}
                onMoveClass={(student) => setMoveStudent(student)}
                canEditClasses={canEditClasses}
                loading={loading}
                currentPage={currentPage}
                itemsPerPage={studentsPerPage}
              />

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-4">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage <= 1}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      currentPage <= 1
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-accent text-white hover:bg-accent-dark"
                    }`}
                  >
                    Sebelumnya
                  </button>
                  <span className="text-gray-700 dark:text-gray-300">
                    Halaman {pagination.currentPage} dari{" "}
                    {pagination.totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= pagination.totalPages}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      currentPage >= pagination.totalPages
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-accent text-white hover:bg-accent-dark"
                    }`}
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* UPDATED MODALS - PASS showToastHandler */}
        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
          showToast={showToastHandler}
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
            showToast={showToastHandler}
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
            showToast={showToastHandler}
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
            showToast={showToastHandler}
            classes={classes}
            angkatans={angkatans}
          />
        )}
      </div>

      {/* TOAST CONTAINER */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </AdminLayout>
  );
};

export default ManagementStudentPage;
