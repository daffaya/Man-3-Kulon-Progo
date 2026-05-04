import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Trash2,
  RefreshCw,
  ArrowLeft,
  GraduationCap,
  Search,
  AlertCircle,
  FileText,
} from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import kelulusanApi from "../../../api/kelulusanApi";
import type { KelulusanSummary } from "../../../types/kelulusanTypes";

const ITEMS_PER_PAGE = 20;

const KelulusanManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [data, setData] = useState<KelulusanSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tahunList, setTahunList] = useState<string[]>([]);
  const [tahunAktif, setTahunAktif] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importTahun, setImportTahun] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTahun, setDeleteTahun] = useState("");

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const fetchTahunAjaran = useCallback(async () => {
    try {
      const res = await kelulusanApi.getTahunAjaran();
      setTahunList(res.data);
      setTahunAktif(res.aktif);
      if (!filterTahun) setFilterTahun(res.aktif);
      if (!importTahun) setImportTahun(res.aktif);
    } catch (error: any) {
      showErrorToast("Gagal memuat tahun ajaran");
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await kelulusanApi.getAll({
        tahun_ajaran: filterTahun || undefined,
        search: search || undefined,
        page,
        limit: ITEMS_PER_PAGE,
      });
      setData(result.data);
      setTotal(result.total);
    } catch (error: any) {
      showErrorToast("Gagal memuat data kelulusan");
    } finally {
      setLoading(false);
    }
  }, [filterTahun, search, page]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchTahunAjaran();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn, fetchData]);

  useEffect(() => {
    setPage(1);
  }, [filterTahun, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleImport = async () => {
    if (!importFile) return;
    setIsImporting(true);
    try {
      const result = await kelulusanApi.importExcel(importFile, importTahun);
      showSuccessToast(result.message);
      setImportFile(null);
      fetchTahunAjaran();
      fetchData();
    } catch (error: any) {
      showErrorToast(error.message || "Gagal mengimpor data");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await kelulusanApi.deleteByTahunAjaran(deleteTahun);
      showSuccessToast(result.message);
      setShowDeleteConfirm(false);
      fetchTahunAjaran();
      fetchData();
    } catch (error: any) {
      showErrorToast(error.message || "Gagal menghapus data");
    }
  };

  if (isLoadingAuth) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
        {/* ── Header ── */}
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
              <GraduationCap className="h-7 w-7 text-accent" />
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Manajemen Kelulusan
              </h1>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* ── Import Section ── */}
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Upload size={18} className="text-accent" />
            Import Data Kelulusan
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs text-secondary mb-1">
                File Excel (.xlsx)
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                className="form-input w-full text-sm"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-xs text-secondary mb-1">
                Tahun Ajaran
              </label>
              <input
                type="text"
                value={importTahun}
                onChange={(e) => setImportTahun(e.target.value)}
                placeholder="Contoh: 2025/2026"
                className="form-input w-full"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleImport}
                disabled={!importFile || !importTahun || isImporting}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />{" "}
                    Mengimpor...
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Import
                  </>
                )}
              </button>
            </div>
          </div>

          {importFile && (
            <p className="text-xs text-secondary mt-2">
              File dipilih:{" "}
              <strong className="text-foreground">{importFile.name}</strong>
            </p>
          )}

          <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-lg text-xs text-secondary">
            <strong className="text-accent">
              Format kolom Excel yang diharapkan:
            </strong>{" "}
            NO · NISM · NISN · NOMOR ASESMEN MADRASAH · NAMA PESERTA DIDIK ·
            KELAS · DINYATAKAN · FILE_PENGUMUMAN
            <br />
            Kolom <strong>DINYATAKAN</strong> harus berisi teks "LULUS" atau
            "TIDAK LULUS". Kolom <strong>FILE_PENGUMUMAN</strong> berisi link
            Google Drive pengumuman tiap siswa.
          </div>
        </div>

        {/* ── Filter & Delete ── */}
        <div className="card p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari nama atau NISN..."
                  className="form-input pl-9 w-full"
                />
              </div>
              <button type="submit" className="btn btn-primary px-4">
                Cari
              </button>
            </form>

            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="form-input sm:w-48"
            >
              {tahunList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {filterTahun && (
              <button
                onClick={() => {
                  setDeleteTahun(filterTahun);
                  setShowDeleteConfirm(true);
                }}
                className="btn flex items-center gap-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg px-3 py-2"
              >
                <Trash2 size={15} />
                Hapus {filterTahun}
              </button>
            )}
          </div>

          <p className="text-sm text-secondary mt-3">
            Total: <strong className="text-foreground">{total}</strong> siswa
            {filterTahun && ` · ${filterTahun}`}
            {tahunAktif && filterTahun === tahunAktif && (
              <span className="ml-2 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                Tahun Aktif
              </span>
            )}
          </p>
        </div>

        {/* ── Delete Confirm ── */}
        {showDeleteConfirm && (
          <div className="card p-5 mb-6 border-red-300/50 dark:border-red-800/50 border bg-red-50 dark:bg-red-900/10">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <p className="text-foreground font-semibold text-sm">
                  Hapus semua data kelulusan tahun ajaran{" "}
                  <strong>{deleteTahun}</strong>?
                </p>
                <p className="text-secondary text-xs mt-1">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleDelete}
                    className="btn text-xs px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-lg"
                  >
                    Ya, Hapus
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn btn-secondary text-xs px-3 py-1.5"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="card overflow-x-auto shadow">
          {loading ? (
            <div className="p-12 text-center text-secondary animate-pulse">
              Memuat data...
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center text-secondary">
              Tidak ada data kelulusan.
              {!tahunList.length && " Import data Excel untuk memulai."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-semibackground text-secondary text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">NISN</th>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    NISM
                  </th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    No. Asesmen
                  </th>
                  <th className="px-4 py-3 text-left">Kelas</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {data.map((row, i) => (
                  <tr
                    key={row.id}
                    className="hover:bg-accent/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-secondary">
                      {(page - 1) * ITEMS_PER_PAGE + i + 1}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {row.nisn}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {row.nama}
                    </td>
                    <td className="px-4 py-3 text-secondary hidden md:table-cell">
                      {row.nism || "—"}
                    </td>
                    <td className="px-4 py-3 text-secondary hidden md:table-cell">
                      {row.nomor_asesmen || "—"}
                    </td>
                    <td className="px-4 py-3 text-secondary">{row.kelas}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          row.status === "lulus"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {row.status === "lulus" ? "Lulus" : "Belum Lulus"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.file_pengumuman ? (
                        <a
                          href={row.file_pengumuman}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-accent/10 text-accent transition-colors"
                          title="Lihat file pengumuman"
                        >
                          <FileText size={18} />
                        </a>
                      ) : (
                        <span className="text-secondary text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary text-sm disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-secondary">
              Halaman <strong className="text-foreground">{page}</strong> /{" "}
              {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary text-sm disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default KelulusanManagementPage;
