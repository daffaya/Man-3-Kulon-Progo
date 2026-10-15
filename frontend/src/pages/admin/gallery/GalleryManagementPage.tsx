/**
 * @fileoverview Halaman "Galeri" admin (mockup v3): kartu album dengan cover, judul, tanggal,
 * jumlah foto, dan aksi Kelola Foto / Sunting / Hapus. AlbumCard & AlbumList publik tidak diubah.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Calendar, ImagePlus, Images, Plus, Search, SearchX, SquarePen, Trash2 } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import ImageWithFallback from "../../../components/ui/ImageWithFallback";
import { useGallery } from "../../../contexts/GalleryContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { shortDate } from "../../../hooks/useAdminSummary";

export const ALLOWED_ROLES = [
  "super_admin",
  "jurnalis",
  "pengelola_bmn",
  "guru_bk",
  "arsiparis",
] as const;

const PER_PAGE = 12;

const GalleryManagementPage: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const allowed =
    isLoggedIn && !!user && (ALLOWED_ROLES as readonly string[]).includes(user.role);

  const { state, deleteAlbum, fetchAdminAlbums } = useGallery();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [params] = useSearchParams();
  const urlQ = params.get("q") ?? "";
  const [input, setInput] = useState(urlQ);
  const [keyword, setKeyword] = useState(urlQ);

  useEffect(() => {
    setInput(urlQ);
  }, [urlQ]);
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<string | null>(null);
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
    fetchAdminAlbums({ keyword: keyword || undefined, page, limit: PER_PAGE });
  }, [keyword, page, fetchAdminAlbums]);

  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteAlbum(toDelete);
      showSuccessToast("Album berhasil dihapus");
      setToDelete(null);
      load();
    } catch {
      showErrorToast("Gagal menghapus album");
    } finally {
      setDeleting(false);
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ redirectTo: "/atmin/gallery" }} replace />;
  }
  if (!allowed) return <Navigate to="/atmin" replace />;

  const { adminAlbums: albums, adminLoading: loading, adminPagination: pg } = state;
  const empty = !loading && albums.length === 0;

  return (
    <AdminLayout>
      <div className="a-pg">
        <div className="a-hd">
          <div>
            <h1 className="a-h1">Galeri</h1>
            <p className="a-sub">Kelola album foto kegiatan sekolah.</p>
          </div>
          <Link to="/atmin/gallery/new" className="a-btn a-p">
            <Plus size={18} />
            Album Baru
          </Link>
        </div>

        <div className="a-tl" style={{ border: "1px solid var(--bd)", borderRadius: 12, background: "var(--sf)", marginBottom: 16 }}>
          <div className="a-sr">
            <Search size={16} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cari judul album…"
              aria-label="Cari album"
            />
          </div>
        </div>

        {loading ? (
          <div className="a-gg" aria-busy="true">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="a-cd a-gc">
                <div className="a-cv" />
                <div className="a-gb">
                  <div className="a-sk" style={{ width: "80%", marginBottom: 12 }} />
                  <div className="a-sk" style={{ width: "50%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : empty ? (
          <div className="a-cd">
            <div className="a-em">
              {keyword ? <SearchX /> : <Images />}
              <b>{keyword ? "Album tidak ditemukan" : "Belum ada album"}</b>
              {keyword ? "Coba kata kunci lain." : "Buat album pertama untuk foto kegiatan sekolah."}
              <br />
              {keyword ? (
                <button type="button" className="a-btn a-sm" style={{ marginTop: 12 }} onClick={() => setInput("")}>
                  Reset pencarian
                </button>
              ) : (
                <Link to="/atmin/gallery/new" className="a-btn a-p" style={{ marginTop: 12 }}>
                  <Plus size={18} />
                  Buat Album Pertama
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="a-gg">
            {albums.map((a) => (
              <article key={a.id} className="a-cd a-gc">
                <Link to={`/atmin/gallery/${a.id}/photos`} className="a-cv" aria-label={`Kelola foto ${a.title}`}>
                  {a.cover_thumbnail_url ? (
                    <ImageWithFallback
                      src={a.cover_thumbnail_url}
                      alt={a.title}
                      className="w-full h-full object-cover"
                      fallback="/placeholder-image.jpg"
                    />
                  ) : (
                    <Images />
                  )}
                </Link>
                <div className="a-gb">
                  <b>{a.title}</b>
                  <div className="a-gm">
                    <span>
                      <Calendar size={14} />
                      {shortDate(a.created_at)}
                    </span>
                    <span className="a-b a-ok">{a.photo_count} foto</span>
                  </div>
                  <div className="a-gf">
                    <Link to={`/atmin/gallery/${a.id}/photos`} className="a-btn a-sm">
                      <ImagePlus size={16} />
                      Kelola Foto
                    </Link>
                    <Link to={`/atmin/gallery/${a.id}/edit`} className="a-ic" aria-label={`Sunting album ${a.title}`} title="Sunting album">
                      <SquarePen size={18} />
                    </Link>
                    <button type="button" className="a-ic a-x" aria-label={`Hapus album ${a.title}`} title="Hapus album" onClick={() => setToDelete(a.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!empty && pg.totalPages > 1 && (
          <div className="a-tf" style={{ marginTop: 16, border: "1px solid var(--bd)", borderRadius: 12, background: "var(--sf)" }}>
            <span>{pg.totalAlbums} album</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button type="button" className="a-btn a-sm" disabled={loading || pg.currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
                Sebelumnya
              </button>
              Halaman {pg.currentPage} dari {pg.totalPages}
              <button type="button" className="a-btn a-sm a-p" disabled={loading || pg.currentPage >= pg.totalPages} onClick={() => setPage((p) => p + 1)}>
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {toDelete && (
        <div className="a-mo" role="dialog" aria-modal="true" aria-labelledby="gdel-t">
          <div className="a-mc">
            <h2 className="a-h2" id="gdel-t" style={{ marginBottom: 8 }}>Hapus album?</h2>
            <p style={{ color: "var(--mu)", marginBottom: 20 }}>
              Semua foto di dalam album juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="a-btn" onClick={() => setToDelete(null)} disabled={deleting}>Batal</button>
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

export default GalleryManagementPage;
