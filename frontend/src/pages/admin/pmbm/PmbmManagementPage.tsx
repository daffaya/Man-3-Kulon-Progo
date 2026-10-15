/**
 * @fileoverview PmbmManagementPage - Admin panel for managing PMBM registrations.
 * Provides a table view with filtering by gelombang, jalur, and status,
 * along with detail modal, status update, and Excel export functionality.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { RefreshCw, Download } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import PmbmTable from "../../../components/tables/PmbmTable";
import PmbmDetailModal from "../../../components/modals/PmbmDetailModal";
import {
  EmptyState,
  FilterSelect,
  PageHead,
  SearchBox,
  Segmented,
  TableFooter,
  rangeText,
} from "../../../components/admin/ListKit";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import pmbmApi from "../../../api/pmbmApi";
import type { PmbmRegistrationSummary } from "../../../types/pmbmTypes";
import { JALUR_LABEL, STATUS_LABEL } from "../../../types/pmbmTypes";

const ITEMS_PER_PAGE = 10;

/**
 * Helper function to parse filename from Content-Disposition header.
 */
const getFilenameFromHeader = (header: string | null): string => {
  if (!header) return "pendaftar_pmbm.xlsx";
  const filenameMatch = header.match(/filename="?([^"]+)"?/);
  return filenameMatch ? filenameMatch[1] : "pendaftar_pmbm.xlsx";
};

/**
 * Admin page component for managing PMBM (Penerimaan Murid Baru Madrasah) registrations.
 */
const PmbmManagementPage: React.FC = () => {
  const { isLoggedIn, isLoadingAuth } = useAuth();
  const { showErrorToast, showSuccessToast } = useToastMessage();

  const [registrations, setRegistrations] = useState<PmbmRegistrationSummary[]>(
    [],
  );
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [filterGelombang, setFilterGelombang] = useState<string>("1");
  const [filterJalur, setFilterJalur] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Detail modal
  const [selectedRegistration, setSelectedRegistration] =
    useState<PmbmRegistrationSummary | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await pmbmApi.getAll({
        gelombang: filterGelombang ? parseInt(filterGelombang) : undefined,
        jalur: filterJalur || undefined,
        status: filterStatus || undefined,
        search: search || undefined,
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
  }, [filterGelombang, filterJalur, filterStatus, search, currentPage, showErrorToast]);

  useEffect(() => {
    if (isLoggedIn) fetchRegistrations();
  }, [isLoggedIn, fetchRegistrations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterGelombang, filterJalur, filterStatus, search]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  /**
   * Handles the Excel export action.
   * FIXED: Changed URL from /pmbm/export to /pmbm/registrations/export
   */
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL ||
        "https://backend.man3kulonprogo.sch.id/api";

      const params = new URLSearchParams();
      if (filterGelombang) params.append("gelombang", filterGelombang);
      if (filterJalur) params.append("jalur", filterJalur);
      if (filterStatus) params.append("status", filterStatus);
      if (search) params.append("search", search);

      const token = localStorage.getItem("token");

      // PERBAIKAN URL DI SINI: Tambahan /registrations
      const url = `${backendUrl}/pmbm/registrations/export?${params.toString()}`;

      const response = await fetch(url, { credentials: "include",
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const jsonError = JSON.parse(text);
          throw new Error(jsonError.error || "Gagal mengekspor data");
        } catch (e) {
          throw new Error(`Server Error: ${response.status}`);
        }
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = getFilenameFromHeader(contentDisposition);

      a.download = filename;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showSuccessToast("Data berhasil diekspor ke Excel");
    } catch (error: any) {
      console.error("Export error:", error);
      showErrorToast(error.message || "Gagal mengekspor data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDetail = (registration: PmbmRegistrationSummary) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
  };

  if (isLoadingAuth) {
    return (
      <AdminLayout>
        <div className="a-pg">
          <div className="a-cd">
            <div className="a-em">
              <RefreshCw className="animate-spin" />
              <b>Memeriksa autentikasi…</b>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ redirectTo: "/atmin/pmbm" }} replace />;
  }

  const filtered = !!filterJalur || !!filterStatus || !!search;
  const empty = !loading && registrations.length === 0;
  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setFilterJalur("");
    setFilterStatus("");
  };

  return (
    <AdminLayout>
      <div className="a-pg">
        <PageHead title="PMBM" sub="Data pendaftar Penerimaan Murid Baru Madrasah.">
          <button type="button" onClick={fetchRegistrations} disabled={loading} className="a-btn">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || loading}
            className="a-btn a-p"
          >
            {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
            {isExporting ? "Mengekspor…" : "Ekspor Excel"}
          </button>
        </PageHead>

        <div className="a-cd" style={{ padding: 0 }}>
          <div className="a-tl">
            <Segmented
              label="Gelombang"
              value={filterGelombang}
              onChange={(v) => setFilterGelombang(v)}
              options={[["1", "Gelombang I"], ["2", "Gelombang II"]]}
            />
            <SearchBox
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Cari nama, NISN, nomor…"
              label="Cari pendaftar"
            />
            <FilterSelect
              label="Semua jalur"
              value={filterJalur || "all"}
              onChange={(v) => setFilterJalur(v === "all" ? "" : v)}
              options={Object.entries(JALUR_LABEL)}
            />
            <FilterSelect
              label="Semua status"
              value={filterStatus || "all"}
              onChange={(v) => setFilterStatus(v === "all" ? "" : v)}
              options={Object.entries(STATUS_LABEL)}
            />
          </div>

          {empty ? (
            <EmptyState
              filtered={filtered}
              entity="pendaftar"
              hint="Belum ada pendaftar pada gelombang ini."
              onReset={resetFilters}
            />
          ) : (
            <PmbmTable
              registrations={registrations}
              onDetail={handleDetail}
              loading={loading}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}

          {!empty && (
            <TableFooter
              text={loading ? "Memuat…" : filtered ? `${total} hasil ditemukan` : rangeText(currentPage, ITEMS_PER_PAGE, total, "pendaftar")}
              page={currentPage}
              totalPages={totalPages}
              loading={loading}
              onPrev={() => handlePageChange(currentPage - 1)}
              onNext={() => handlePageChange(currentPage + 1)}
            />
          )}
        </div>
      </div>

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
