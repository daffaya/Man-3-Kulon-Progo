/**
 * @fileoverview Halaman "Artikel" admin (mockup v2): toolbar (cari, status, kategori),
 * tabel artikel dengan paginasi server-side, filter tag/unggulan lewat klik pada baris,
 * dan dialog konfirmasi hapus.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Inbox, Plus, Search, SearchX, Tags, X } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import ArticleTable from "../../../components/tables/ArticleTable";
import { useArticles } from "../../../contexts/ArticleContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { invalidateAdminSummary } from "../../../hooks/useAdminSummary";
import type { ArticleFilters } from "../../../types/articleTypes";

export const ALLOWED_ROLES = ["jurnalis", "super_admin"] as const;

const PER_PAGE = 10;

type Status = "all" | "published" | "draft";

interface Query {
  keyword: string;
  status: Status;
  tags: string[];
  category: string;
  page: number;
}

const SEGMENTS: [Status, string][] = [
  ["all", "Semua"],
  ["published", "Terbit"],
  ["draft", "Draf"],
];

const ArticleManagementPage: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const allowed =
    isLoggedIn && !!user && (ALLOWED_ROLES as readonly string[]).includes(user.role);

  const { state, deleteArticle, fetchAdminArticles, fetchAdminCategories } = useArticles();
  const { showSuccessToast, showErrorToast } = useToastMessage();
  const [params] = useSearchParams();
  const urlQ = params.get("q") ?? "";

  const [q, setQ] = useState<Query>({
    keyword: urlQ,
    status: "all",
    tags: [],
    category: "all",
    page: 1,
  });
  const [input, setInput] = useState(urlQ);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const patch = useCallback(
    (p: Partial<Query>) => setQ((s) => ({ ...s, page: 1, ...p })),
    [],
  );

  // Pencarian dari top bar (?q=) saat halaman sudah terbuka.
  useEffect(() => {
    setInput(urlQ);
    patch({ keyword: urlQ });
  }, [urlQ, patch]);

  // Debounce kolom cari.
  useEffect(() => {
    const t = setTimeout(() => {
      const kw = input.trim();
      setQ((s) => (s.keyword === kw ? s : { ...s, keyword: kw, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [input]);

  const load = useCallback(() => {
    const f: ArticleFilters = {
      keyword: q.keyword || undefined,
      published: q.status === "all" ? undefined : q.status === "published",
      tag: q.tags.length ? q.tags : undefined,
      category: q.category !== "all" ? q.category : undefined,
      page: q.page,
      limit: PER_PAGE,
    };
    fetchAdminArticles(f);
  }, [q, fetchAdminArticles]);

  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  useEffect(() => {
    if (allowed) fetchAdminCategories();
  }, [allowed, fetchAdminCategories]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteArticle(toDelete);
      invalidateAdminSummary();
      showSuccessToast("Artikel berhasil dihapus");
      setToDelete(null);
      load();
    } catch {
      showErrorToast("Gagal menghapus artikel");
    } finally {
      setDeleting(false);
    }
  };

  const reset = () => {
    setInput("");
    setQ({ keyword: "", status: "all", tags: [], category: "all", page: 1 });
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ redirectTo: "/atmin/articles" }} replace />;
  }
  if (!allowed) return <Navigate to="/atmin" replace />;

  const { adminArticles, adminLoading, adminError, adminPagination: pg } = state;
  const filtered =
    !!q.keyword || q.status !== "all" || q.tags.length > 0 || q.category !== "all";
  const empty = !adminLoading && !adminError && adminArticles.length === 0;
  const from = (pg.currentPage - 1) * PER_PAGE + 1;
  const to = Math.min(pg.currentPage * PER_PAGE, pg.totalArticles);

  return (
    <AdminLayout>
      <div className="a-pg">
        <div className="a-hd">
          <div>
            <h1 className="a-h1">Artikel</h1>
            <p className="a-sub">Kelola berita dan pengumuman yang tampil di website sekolah.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/atmin/category" className="a-btn">
              <Tags size={18} />
              Atur Kategori
            </Link>
            <Link to="/atmin/articles/new" className="a-btn a-p">
              <Plus size={18} />
              Artikel Baru
            </Link>
          </div>
        </div>

        <div className="a-cd" style={{ padding: 0 }}>
          <div className="a-tl">
            <div className="a-sr">
              <Search size={16} />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Cari judul atau isi…"
                aria-label="Cari artikel"
              />
            </div>
            <div className="a-sg" role="group" aria-label="Status artikel">
              {SEGMENTS.map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  className={q.status === k ? "a-on" : ""}
                  aria-pressed={q.status === k}
                  onClick={() => patch({ status: k })}
                >
                  {l}
                </button>
              ))}
            </div>
            <select
              className="a-sel"
              aria-label="Kategori"
              value={q.category}
              onChange={(e) => patch({ category: e.target.value })}
            >
              <option value="all">Semua kategori</option>
              {state.adminCategories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {q.tags.length > 0 && (
            <div className="a-chips" style={{ margin: 0, padding: "10px 14px", borderBottom: "1px solid var(--bd)" }}>
              {q.tags.map((t) => (
                <span key={t} className="a-chip">
                  #{t}
                  <button
                    type="button"
                    aria-label={`Hapus filter tag ${t}`}
                    onClick={() => patch({ tags: q.tags.filter((x) => x !== t) })}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {adminError ? (
            <div className="a-em">
              <SearchX />
              <b>Gagal memuat artikel</b>
              {String(adminError)}
              <br />
              <button type="button" className="a-btn a-sm" style={{ marginTop: 12 }} onClick={load}>
                Coba lagi
              </button>
            </div>
          ) : empty ? (
            <div className="a-em">
              {filtered ? <SearchX /> : <Inbox />}
              <b>{filtered ? "Tidak ada artikel yang cocok" : "Belum ada artikel"}</b>
              {filtered ? "Coba ubah kata kunci atau reset filter." : "Mulai dengan menulis artikel pertama Anda."}
              <br />
              {filtered ? (
                <button type="button" className="a-btn a-sm" style={{ marginTop: 12 }} onClick={reset}>
                  Reset filter
                </button>
              ) : (
                <Link to="/atmin/articles/new" className="a-btn a-p" style={{ marginTop: 12 }}>
                  <Plus size={18} />
                  Tulis Artikel Pertama
                </Link>
              )}
            </div>
          ) : (
            <ArticleTable
              articles={adminArticles}
              loading={adminLoading}
              onDelete={setToDelete}
              onTagClick={(t) => !q.tags.includes(t) && patch({ tags: [...q.tags, t] })}
            />
          )}

          {!adminError && !empty && (
            <div className="a-tf">
              <span>
                {adminLoading
                  ? "Memuat…"
                  : filtered
                    ? `${pg.totalArticles} hasil ditemukan`
                    : `Menampilkan ${from}–${to} dari ${pg.totalArticles} artikel`}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  className="a-btn a-sm"
                  disabled={adminLoading || pg.currentPage <= 1}
                  onClick={() => setQ((s) => ({ ...s, page: s.page - 1 }))}
                >
                  Sebelumnya
                </button>
                Halaman {pg.currentPage} dari {Math.max(pg.totalPages, 1)}
                <button
                  type="button"
                  className="a-btn a-sm a-p"
                  disabled={adminLoading || pg.currentPage >= pg.totalPages}
                  onClick={() => setQ((s) => ({ ...s, page: s.page + 1 }))}
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toDelete && (
        <div className="a-mo" role="dialog" aria-modal="true" aria-labelledby="del-t">
          <div className="a-mc">
            <h2 className="a-h2" id="del-t" style={{ marginBottom: 8 }}>Hapus artikel?</h2>
            <p style={{ color: "var(--mu)", marginBottom: 20 }}>
              Artikel yang dihapus tidak dapat dikembalikan.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="a-btn" onClick={() => setToDelete(null)} disabled={deleting}>
                Batal
              </button>
              <button type="button" className="a-btn a-d" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Menghapus…" : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ArticleManagementPage;
