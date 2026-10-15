/**
 * @fileoverview Halaman "Guru & Staf" admin (mockup v3): toolbar (cari, tipe, jenis kelamin,
 * status), tabel dengan paginasi server-side, dan dialog konfirmasi hapus. Khusus super_admin.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Plus } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import StaffTable from "../../../components/tables/staffTable";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FilterSelect,
  PageHead,
  SearchBox,
  TableFooter,
  rangeText,
} from "../../../components/admin/ListKit";
import { useStaff } from "../../../contexts/StaffContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import type { StaffFilters } from "../../../types/staffTypes";

export const ALLOWED_ROLES = ["super_admin"] as const;
const PER_PAGE = 10;

const StaffManagementPage: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const allowed = isLoggedIn && user?.role === "super_admin";
  const { state, deleteStaff, fetchStaffList } = useStaff();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("all");
  const [gender, setGender] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const kw = input.trim();
      setKeyword((k) => {
        if (k !== kw) setPage(1);
        return kw;
      });
    }, 400);
    return () => clearTimeout(t);
  }, [input]);

  const load = useCallback(() => {
    const f: StaffFilters = {
      keyword: keyword || undefined,
      type: type !== "all" ? type : undefined,
      gender: gender !== "all" ? gender : undefined,
      status: status !== "all" ? status : undefined,
      page,
      limit: PER_PAGE,
    };
    fetchStaffList(f);
  }, [keyword, type, gender, status, page, fetchStaffList]);

  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  const filtered = !!keyword || type !== "all" || gender !== "all" || status !== "all";
  const reset = () => {
    setInput("");
    setKeyword("");
    setType("all");
    setGender("all");
    setStatus("all");
    setPage(1);
  };
  const setF = (fn: (v: string) => void) => (v: string) => {
    fn(v);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (toDelete === null) return;
    setDeleting(true);
    try {
      await deleteStaff(toDelete);
      showSuccessToast("Data berhasil dihapus");
      setToDelete(null);
      load();
    } catch {
      showErrorToast("Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ redirectTo: "/atmin/staff" }} replace />;
  }
  if (!allowed) return <Navigate to="/atmin" replace />;

  const { staffList, loading, error, pagination: pg } = state;
  const empty = !loading && !error && staffList.length === 0;

  return (
    <AdminLayout>
      <div className="a-pg">
        <PageHead title="Guru & Staf" sub="Data guru dan tenaga kependidikan.">
          <Link to="/atmin/staff/new" className="a-btn a-p">
            <Plus size={18} />
            Tambah Data
          </Link>
        </PageHead>

        <div className="a-cd" style={{ padding: 0 }}>
          <div className="a-tl">
            <SearchBox value={input} onChange={setInput} placeholder="Cari nama, NIP, jabatan…" label="Cari guru atau staf" />
            <FilterSelect
              value={type}
              onChange={setF(setType)}
              label="Semua tipe"
              options={[["teacher", "Guru"], ["staff", "Staf"]]}
            />
            <FilterSelect
              value={gender}
              onChange={setF(setGender)}
              label="Semua jenis kelamin"
              options={[["L", "Laki-laki"], ["P", "Perempuan"]]}
            />
            <FilterSelect
              value={status}
              onChange={setF(setStatus)}
              label="Semua status"
              options={[["PNS", "PNS"], ["CPNS", "CPNS"], ["PPPK", "PPPK"]]}
            />
          </div>

          {error ? (
            <ErrorState message={String(error)} onRetry={load} />
          ) : empty ? (
            <EmptyState filtered={filtered} entity="data guru & staf" hint="Tambahkan data guru atau staf pertama." onReset={reset}>
              <Link to="/atmin/staff/new" className="a-btn a-p">
                <Plus size={18} />
                Tambah Data Pertama
              </Link>
            </EmptyState>
          ) : (
            <StaffTable
              staff={staffList}
              onDelete={setToDelete}
              loading={loading}
              currentPage={page}
              itemsPerPage={PER_PAGE}
            />
          )}

          {!error && !empty && (
            <TableFooter
              text={loading ? "Memuat…" : filtered ? `${pg.total} hasil ditemukan` : rangeText(pg.currentPage, PER_PAGE, pg.total, "data")}
              page={pg.currentPage}
              totalPages={pg.totalPages}
              loading={loading}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Hapus data?"
        body="Data yang dihapus tidak dapat dikembalikan."
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
};

export default StaffManagementPage;
