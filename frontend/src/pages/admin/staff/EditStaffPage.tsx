/**
 * @fileoverview Page component for editing an existing staff member.
 * Allows authorized users (super_admin) to modify staff data.
 * Fetches the staff record by ID, handles form submission, and manages loading/error states.
 */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import { useStaff } from "../../../contexts/StaffContext";
import { StaffFormData } from "../../../types/staffTypes";
import StaffForm from "../../../components/forms/StaffForm";
import { RefreshCw, ChevronLeft } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { ALLOWED_ROLES } from "./StaffManagementPage";

/**
 * Determines if the current user has permission to edit staff data.
 * @param isLoggedIn - Whether the user is authenticated.
 * @param role - The user's role.
 * @returns {boolean} True if the user has edit access.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * EditStaffPage component.
 * Displays a form pre-filled with existing staff data and handles updates.
 */
const EditStaffPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, fetchStaffById, updateStaff } = useStaff();
  const { isLoggedIn, user } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const isAdmin = hasEditAccess(isLoggedIn, user?.role);
  const staffId = id ? parseInt(id, 10) : NaN;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Fetch staff data on mount if not already loaded
  useEffect(() => {
    if (!isAdmin || isNaN(staffId)) return;

    const loadStaff = async () => {
      // Skip fetch if the correct staff is already in context
      if (state.currentStaff && state.currentStaff.id === staffId) {
        setHasAttemptedFetch(true);
        return;
      }

      try {
        await fetchStaffById(staffId);
      } catch {
        showErrorToast("Gagal memuat data staff");
      } finally {
        setHasAttemptedFetch(true);
      }
    };

    loadStaff();
  }, [staffId, isAdmin, fetchStaffById, showErrorToast]);

  /**
   * Handles form submission and updates the staff record.
   */
  const handleSubmit = async (formData: StaffFormData) => {
    if (isNaN(staffId)) return;

    setSaving(true);
    setError(null);

    try {
      await updateStaff(staffId, formData);
      showSuccessToast("Data berhasil diperbarui!");
      setTimeout(() => navigate("/atmin/staff"), 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memperbarui data";
      setError(message);
      showErrorToast(message);
    } finally {
      setSaving(false);
    }
  };

  // Redirect unauthenticated users
  if (!isLoggedIn) {
    return (
      <Navigate to="/login" state={{ redirectTo: "/atmin/staff" }} replace />
    );
  }

  // Redirect unauthorized users
  if (!isAdmin) {
    return <Navigate to="/atmin" replace />;
  }

  // Invalid ID
  if (isNaN(staffId)) {
    return (
      <AdminLayout>
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="card p-12">
            <p className="text-xl font-bold mb-4 text-error">ID Tidak Valid</p>
            <p className="text-secondary mb-6">
              ID staff harus berupa angka yang valid.
            </p>
            <Link to="/atmin/staff" className="btn btn-secondary">
              Kembali ke Daftar
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Loading state
  if (state.loading || !hasAttemptedFetch) {
    return (
      <AdminLayout>
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
          <p className="mt-4 text-secondary">Memuat data staff...</p>
        </div>
      </AdminLayout>
    );
  }

  // Staff not found after fetch attempt
  if (!state.currentStaff || state.currentStaff.id !== staffId) {
    return (
      <AdminLayout>
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="card p-12">
            <p className="text-xl font-bold mb-4 text-foreground">
              Data Tidak Ditemukan
            </p>
            <p className="text-secondary mb-6">
              Data staff dengan ID "{id}" tidak dapat dimuat.
            </p>
            <Link to="/atmin/staff" className="btn btn-secondary">
              Kembali ke Manajemen Guru & Staf
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Main form view
  return (
    <AdminLayout>
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="flex items-center mb-6">
          <Link
            to="/atmin/staff"
            className="text-sm text-secondary hover:text-accent flex items-center transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Kembali ke Manajemen Guru & Staf
          </Link>
        </div>

        <div className="card p-6">
          <h1 className="text-3xl font-serif font-bold mb-6 text-foreground">
            Edit Guru & Staf
          </h1>

          {error && (
            <div className="bg-[rgb(var(--color-error),0.1)] border border-[rgb(var(--color-error))] text-[rgb(var(--color-error))] px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <StaffForm
            staff={state.currentStaff}
            onSubmit={handleSubmit}
            isLoading={saving}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditStaffPage;
