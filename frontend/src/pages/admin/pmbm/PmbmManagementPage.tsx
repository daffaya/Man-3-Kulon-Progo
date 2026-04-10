/**
 * @fileoverview PmbmManagementPage - Admin panel for managing PMBM registrations.
 * Provides a table view with filtering by gelombang, jalur, and status,
 * along with detail modal, status update, and Excel export functionality.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  RefreshCw,
  Download,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import PmbmTable from "../../../components/tables/PmbmTable";
import PmbmDetailModal from "../../../components/modals/PmbmDetailModal";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import pmbmApi from "../../../api/pmbmApi";
import type { PmbmRegistrationSummary } from "../../../types/pmbmTypes";
import { JALUR_LABEL, STATUS_LABEL } from "../../../types/pmbmTypes";

const ITEMS_PER_PAGE = 20;

/**
 * Admin page component for managing PMBM (Penerimaan Murid Baru Madrasah) registrations.
 * Supports filtering by gelombang, jalur, and status, viewing full detail in a modal,
 * updating registration status, and exporting filtered data to Excel.
 *
 * @returns {JSX.Element} The rendered admin management page.
 */
const PmbmManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isLoadingAuth } = useAuth();
  const { showErrorToast } = useToastMessage();

  const [registrations, setRegistrations] = useState<PmbmRegistrationSummary[]>(
    [],
  );
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [filterGelombang, setFilterGelombang] = useState<string>("");
  const [filterJalur, setFilterJalur] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Detail modal
  const [selectedRegistration, setSelectedRegistration] =
    useState<PmbmRegistrationSummary | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  /**
   * Fetches the list of registrations from the API based on the current filters and page.
   */
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await pmbmApi.getAll({
        gelombang: filterGelombang ? parseInt(filterGelombang) : undefined,
        jalur: filterJalur || undefined,
        status: filterStatus || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
      setRegistrations(result.data);
      setTotal(result.total);
    } catch (error: any) {
      showErrorToast(error.message || "Gagal memuat data pendaftar");
    } finally {
      setLoading(false);
    }
  }, [filterGelombang, filterJalur, filterStatus, currentPage]);

  useEffect(() => {
    if (isLoggedIn) fetchRegistrations();
  }, [isLoggedIn, fetchRegistrations]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterGelombang, filterJalur, filterStatus]);

  /**
   * Handles the Excel export action using the currently active filters.
   */
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (filterGelombang) params.append("gelombang", filterGelombang);
      if (filterJalur) params.append("jalur", filterJalur);
      if (filterStatus) params.append("status", filterStatus);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/pmbm/registrations/export?${params.toString()}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      if (!response.ok) throw new Error("Gagal mengekspor data");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        response.headers
          .get("Content-Disposition")
          ?.split("filename=")[1]
          ?.replace(/"/g, "") ?? "pendaftar_pmbm.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      showErrorToast(error.message || "Gagal mengekspor data");
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Opens the detail modal for the given registration record.
   * @param {PmbmRegistrationSummary} registration - The registration to view.
   */
  const handleDetail = (registration: PmbmRegistrationSummary) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
  };

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
    navigate("/login", { state: { redirectTo: "/atmin/pmbm" } });
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/atmin")}
              className="text-sm text-secondary hover:text-accent flex items-center transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </button>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-7 w-7 text-accent" />
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Manajemen PMBM
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchRegistrations}
              disabled={loading}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || loading}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? "Mengekspor..." : "Export Excel"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
              <select
                value={filterGelombang}
                onChange={(e) => setFilterGelombang(e.target.value)}
                className="form-input w-full pl-10 appearance-none"
              >
                <option value="">Semua Gelombang</option>
                <option value="1">Gelombang I</option>
                <option value="2">Gelombang II</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
              <select
                value={filterJalur}
                onChange={(e) => setFilterJalur(e.target.value)}
                className="form-input w-full pl-10 appearance-none"
              >
                <option value="">Semua Jalur</option>
                {Object.entries(JALUR_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-input w-full pl-10 appearance-none"
              >
                <option value="">Semua Status</option>
                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 text-sm text-secondary">
            Total: <strong className="text-foreground">{total}</strong>{" "}
            pendaftar ditemukan
          </div>
        </div>

        {/* Table */}
        <div className="card p-6">
          <PmbmTable
            registrations={registrations}
            onDetail={handleDetail}
            loading={loading}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary text-sm"
              >
                Sebelumnya
              </button>
              <span className="text-sm text-secondary">
                Halaman{" "}
                <strong className="text-foreground">{currentPage}</strong> dari{" "}
                <strong className="text-foreground">{totalPages}</strong>
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="btn btn-secondary text-sm"
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <PmbmDetailModal
        registration={selectedRegistration}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRegistration(null);
        }}
        onStatusUpdated={fetchRegistrations}
      />
    </AdminLayout>
  );
};

export default PmbmManagementPage;
