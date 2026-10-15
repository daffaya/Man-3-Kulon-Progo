import React, { useState, useEffect, useCallback, useRef } from "react";
import { Navigate } from "react-router-dom";
import { Upload, Trash2, RefreshCw, FileSpreadsheet, FileText, Info } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import {
  ConfirmDialog,
  EmptyState,
  PageHead,
  SearchBox,
  TableFooter,
  SkeletonRows,
  rangeText,
} from "../../../components/admin/ListKit";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import kelulusanApi from "../../../api/kelulusanApi";
import type { KelulusanSummary } from "../../../types/kelulusanTypes";

const ITEMS_PER_PAGE = 20;

const KelulusanManagementPage: React.FC = () => {
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
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleImport = async () => {
    if (!importFile) return;
    setIsImporting(true);
    try {
      const result = await kelulusanApi.importExcel(importFile, importTahun);
      showSuccessToast(result.message);
      setImportFile(null);
      if (fileRef.current) fileRef.current.value = "";
      fetchTahunAjaran();
      fetchData();
    } catch (error: any) {
      showErrorToast(error.message || "Gagal mengimpor data");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await kelulusanApi.deleteByTahunAjaran(deleteTahun);
      showSuccessToast(result.message);
      setShowDeleteConfirm(false);
      fetchTahunAjaran();
      fetchData();
    } catch (error: any) {
      showErrorToast(error.message || "Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
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
    return <Navigate to="/login" state={{ redirectTo: "/atmin/kelulusan" }} replace />;
  }

  const empty = !loading && data.length === 0;

  return (
    <AdminLayout>
      <div className="a-pg">
        <PageHead title="Cek Kelulusan" sub="Kelola hasil kelulusan siswa yang tampil di website.">
          <button type="button" onClick={fetchData} disabled={loading} className="a-btn">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </PageHead>

        <section className="a-cd" style={{ marginBottom: 16 }}>
          <div className="a-ch"><h2 className="a-h2">Import data kelulusan</h2></div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 260px" }}>
              <span className="a-lb" id="imp-l">File Excel (.xlsx)</span>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="a-dz"
                aria-labelledby="imp-l"
                style={{ padding: 11 }}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) setImportFile(f);
                }}
              >
                {importFile ? <FileSpreadsheet size={18} style={{ display: "inline" }} /> : <Upload size={18} style={{ display: "inline" }} />}{" "}
                {importFile ? importFile.name : "Pilih atau seret file .xlsx"}
              </button>
            </div>
            <div>
              <label className="a-lb" htmlFor="imp-t">Tahun ajaran</label>
              <input
                id="imp-t"
                className="a-ip"
                style={{ width: 150 }}
                list="tahun-list"
                value={importTahun}
                onChange={(e) => setImportTahun(e.target.value)}
                placeholder="2025/2026"
              />
              <datalist id="tahun-list">
                {tahunList.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <button
              type="button"
              onClick={handleImport}
              disabled={!importFile || !importTahun || isImporting}
              className="a-btn a-p"
              title={!importFile ? "Pilih file terlebih dahulu" : undefined}
            >
              {isImporting ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
              {isImporting ? "Mengimpor…" : "Import"}
            </button>
          </div>
          <div className="a-nt">
            <Info size={18} />
            <div>
              <b>Format kolom Excel:</b> NO · NISM · NISN · NOMOR ASESMEN MADRASAH · NAMA PESERTA DIDIK · KELAS ·
              DINYATAKAN · FILE_PENGUMUMAN. Kolom DINYATAKAN berisi "LULUS" atau "TIDAK LULUS"; FILE_PENGUMUMAN
              berisi tautan Google Drive.
            </div>
          </div>
        </section>

        <div className="a-cd" style={{ padding: 0 }}>
          <div className="a-tl">
            <SearchBox value={searchInput} onChange={setSearchInput} placeholder="Cari nama atau NISN…" label="Cari siswa" />
            <select
              className="a-sel"
              aria-label="Tahun ajaran"
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
            >
              {tahunList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {tahunAktif && filterTahun === tahunAktif && (
              <span className="a-b a-ok">Tahun aktif · {total} siswa</span>
            )}
            {filterTahun && (
              <button
                type="button"
                className="a-btn a-dng"
                style={{ marginLeft: "auto" }}
                onClick={() => {
                  setDeleteTahun(filterTahun);
                  setShowDeleteConfirm(true);
                }}
              >
                <Trash2 size={16} />
                Hapus {filterTahun}
              </button>
            )}
          </div>

          {empty ? (
            <EmptyState
              filtered={!!search}
              entity="data kelulusan"
              hint={!tahunList.length ? "Import data Excel untuk memulai." : "Belum ada data untuk tahun ajaran ini."}
              onReset={() => setSearchInput("")}
            />
          ) : (
            <div className="a-tw">
              <table className="a-tbl" style={{ minWidth: 760 }}>
                <thead>
                  <tr>
                    <th>NISN</th>
                    <th>Nama</th>
                    <th>NISM</th>
                    <th>No. asesmen</th>
                    <th>Kelas</th>
                    <th>Status</th>
                    <th>File</th>
                  </tr>
                </thead>
                <tbody aria-busy={loading}>
                  {loading ? (
                    <SkeletonRows cols={7} />
                  ) : (
                    data.map((row) => (
                      <tr key={row.id}>
                        <td>{row.nisn}</td>
                        <td><b>{row.nama}</b></td>
                        <td>{row.nism || "—"}</td>
                        <td>{row.nomor_asesmen || "—"}</td>
                        <td>{row.kelas}</td>
                        <td>
                          <span className={`a-b ${row.status === "lulus" ? "a-ok" : "a-dg"}`}>
                            {row.status === "lulus" ? "Lulus" : "Belum Lulus"}
                          </span>
                        </td>
                        <td>
                          {row.file_pengumuman ? (
                            <div className="a-acts" style={{ justifyContent: "flex-start" }}>
                              <a
                                href={row.file_pengumuman}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Buka file pengumuman"
                                aria-label={`Buka file pengumuman ${row.nama}`}
                              >
                                <FileText size={18} />
                              </a>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!empty && (
            <TableFooter
              text={loading ? "Memuat…" : search ? `${total} hasil ditemukan` : rangeText(page, ITEMS_PER_PAGE, total, "siswa")}
              page={page}
              totalPages={totalPages}
              loading={loading}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title={`Hapus data kelulusan ${deleteTahun}?`}
        body="Semua data kelulusan pada tahun ajaran ini akan dihapus. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        busy={deleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
};

export default KelulusanManagementPage;
