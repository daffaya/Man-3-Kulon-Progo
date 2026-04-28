/**
 * @fileoverview Public PMBM registration status page.
 * Displays paginated registration data with search, filtering,
 * and sorting based on selected gelombang.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import Layout from "../../../components/layout/Layout";
import pmbmApi from "../../../api/pmbmApi";
import type { PmbmPublicEntry } from "../../../types/pmbmTypes";
import { JALUR_LABEL, STATUS_LABEL } from "../../../types/pmbmTypes";
import { GELOMBANG_AKTIF } from "./pmbmConfig";

/**
 * Status badge color mapping.
 */
const STATUS_COLOR: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  verified: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  accepted:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

/**
 * Available jalur filter options.
 */
const JALUR_OPTIONS = [
  { value: "", label: "Semua Jalur" },
  { value: "tahfidz", label: "Tahfidz" },
  { value: "kko", label: "KKO" },
  { value: "keterampilan", label: "Keterampilan" },
  { value: "akademik", label: "Akademik" },
  { value: "non_akademik", label: "Non-Akademik" },
  { value: "afirmasi", label: "Afirmasi" },
  { value: "tes", label: "Tes" },
];

const LIMIT = 20;

/**
 * Public status page component.
 */
const PmbmStatusPage: React.FC = () => {
  const [data, setData] = useState<PmbmPublicEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [jalurFilter, setJalurFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Default ke gelombang aktif (fallback: 1)
  const [gelombangFilter, setGelombangFilter] = useState<string>(
    String(GELOMBANG_AKTIF ?? 1),
  );

  /**
   * Fetch public registration data.
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await pmbmApi.getPublic({
        search: search || undefined,
        jalur: jalurFilter || undefined,
        gelombang: gelombangFilter ? parseInt(gelombangFilter) : undefined,
        sortBy,
        page,
        limit: LIMIT,
      });

      setData(result.data);
      setTotal(result.total);
    } catch {
      setError("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [search, jalurFilter, gelombangFilter, sortBy, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Reset page when filters change.
   */
  useEffect(() => {
    setPage(1);
  }, [search, jalurFilter, gelombangFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const totalPages = Math.ceil(total / LIMIT);

  /**
   * Filter jalur options based on selected gelombang.
   */
  const filteredJalurOptions = JALUR_OPTIONS.filter((o) => {
    if (!o.value) return true;
    if (gelombangFilter === "1") return o.value !== "tes";
    if (gelombangFilter === "2") return o.value === "tes";
    return true;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-semibackground py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Status Pendaftaran PMBM
            </h1>
            <p className="text-secondary mt-1 text-sm">
              MAN 3 Kulon Progo — TA 2026/2027
            </p>
          </div>

          {/* Gelombang Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-secondary/20 mb-6 max-w-xs mx-auto">
            {[
              { value: "1", label: "Gelombang I" },
              { value: "2", label: "Gelombang II" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setGelombangFilter(tab.value);
                  setJalurFilter("");
                  setSearch("");
                  setSearchInput("");
                }}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors
                  ${
                    gelombangFilter === tab.value
                      ? "bg-accent text-white"
                      : "text-secondary hover:text-foreground hover:bg-accent/5"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
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
                  placeholder="Cari nama atau nomor pendaftaran..."
                  className="form-input pl-9 w-full"
                />
              </div>
              <button type="submit" className="btn btn-primary px-4">
                Cari
              </button>
            </form>

            {gelombangFilter === "1" && (
              <div className="relative sm:w-48">
                <Filter
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
                />
                <select
                  value={jalurFilter}
                  onChange={(e) => {
                    setJalurFilter(e.target.value);
                    setPage(1);
                  }}
                  className="form-input pl-8 w-full"
                >
                  {filteredJalurOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {gelombangFilter === "2" && (
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="form-input sm:w-52"
              >
                <option value="created_at">Urut: Tgl Daftar</option>
                <option value="nilai_tka_literasi">
                  Urut: Nilai Literasi ↓
                </option>
                <option value="nilai_tka_numerasi">
                  Urut: Nilai Numerasi ↓
                </option>
              </select>
            )}

            <button
              onClick={fetchData}
              className="btn btn-secondary flex items-center gap-2 px-4"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Info */}
          <p className="text-sm text-secondary mb-3">
            Menampilkan{" "}
            <strong className="text-foreground">{data.length}</strong> dari{" "}
            <strong className="text-foreground">{total}</strong> pendaftar
          </p>

          {/* Table */}
          <div className="card overflow-x-auto shadow">
            {error && (
              <div className="p-6 text-center text-red-500">{error}</div>
            )}

            {isLoading ? (
              <div className="p-12 text-center text-secondary animate-pulse">
                Memuat data...
              </div>
            ) : data.length === 0 && !error ? (
              <div className="p-12 text-center text-secondary">
                Tidak ada data ditemukan.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-semibackground text-secondary text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left hidden sm:table-cell">
                      No
                    </th>
                    <th className="px-4 py-3 text-left">No. Pendaftaran</th>
                    <th className="px-4 py-3 text-left">Nama</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">
                      Asal Sekolah
                    </th>
                    {gelombangFilter === "1" && (
                      <th className="px-4 py-3 text-left">Jalur</th>
                    )}
                    {gelombangFilter === "2" && (
                      <>
                        <th className="px-4 py-3 text-left hidden md:table-cell">
                          Literasi
                        </th>
                        <th className="px-4 py-3 text-left hidden md:table-cell">
                          Numerasi
                        </th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left hidden md:table-cell">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-secondary/10">
                  {data.map((row, i) => (
                    <tr key={row.nomor_pendaftaran}>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {(page - 1) * LIMIT + i + 1}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {row.nomor_pendaftaran}
                      </td>
                      <td className="px-4 py-3">{row.nama_lengkap}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {row.asal_sekolah}
                      </td>
                      {gelombangFilter === "1" && (
                        <td className="px-4 py-3">
                          {JALUR_LABEL[row.jalur] ?? row.jalur}
                        </td>
                      )}
                      {gelombangFilter === "2" && (
                        <>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {row.nilai_tka_literasi ?? "—"}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {row.nilai_tka_numerasi ?? "—"}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 hidden md:table-cell">
                        {new Date(row.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            STATUS_COLOR[row.status]
                          }`}
                        >
                          {STATUS_LABEL[row.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PmbmStatusPage;
