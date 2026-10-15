/**
 * @fileoverview AdminSearch — pencarian global di top bar (mockup v3: "Cari artikel, galeri, arsip…").
 * Mengetik menampilkan hasil per modul (Artikel, Galeri, Arsip) sesuai role; Enter membuka
 * daftar modul pertama yang punya hasil dengan kata kunci terisi.
 */
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Archive, Images, Newspaper, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import articleApi from "../../api/articleApi";
import galleryApi from "../../api/galleryApi";
import { fetchArchives } from "../../api/archiveApi";
import { useAuth } from "../../contexts/AuthContext";
import { ARTICLE_ROLES } from "../../hooks/useAdminSummary";

interface Hit {
  key: string;
  title: string;
  meta: string;
  to: string;
}
interface Group {
  key: string;
  label: string;
  icon: LucideIcon;
  listTo: string;
  hits: Hit[];
}

const ARCHIVE_ROLES = ["arsiparis", "super_admin"];

const AdminSearch: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const role = user?.role ?? "";
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
    setQ("");
  }, [pathname]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setGroups([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const enc = encodeURIComponent(term);
      const jobs: Promise<Group | null>[] = [];
      if (ARTICLE_ROLES.includes(role)) {
        jobs.push(
          articleApi
            .getAdminArticles({ keyword: term, limit: 4 })
            .then((r) => ({
              key: "art",
              label: "Artikel",
              icon: Newspaper,
              listTo: `/atmin/articles?q=${enc}`,
              hits: r.articles.map((a) => ({
                key: a.id,
                title: a.title,
                meta: a.published ? "Terbit" : "Draf",
                to: `/atmin/articles/${a.id}/edit`,
              })),
            }))
            .catch(() => null),
        );
      }
      jobs.push(
        galleryApi
          .getAdminAlbums({ keyword: term, limit: 4 })
          .then((r) => ({
            key: "gal",
            label: "Galeri",
            icon: Images,
            listTo: `/atmin/gallery?q=${enc}`,
            hits: r.albums.map((a) => ({
              key: a.id,
              title: a.title,
              meta: `${a.photo_count} foto`,
              to: `/atmin/gallery/${a.id}/photos`,
            })),
          }))
          .catch(() => null),
      );
      if (ARCHIVE_ROLES.includes(role)) {
        jobs.push(
          fetchArchives(term, "")
            .then((r) => ({
              key: "arc",
              label: "Arsip",
              icon: Archive,
              listTo: `/archives?q=${enc}`,
              hits: r.slice(0, 4).map((a) => ({
                key: String(a.id),
                title: a.file_name,
                meta: a.category_name ?? "Arsip",
                to: `/archives?q=${encodeURIComponent(a.file_name)}`,
              })),
            }))
            .catch(() => null),
        );
      }
      const res = (await Promise.all(jobs)).filter((g): g is Group => !!g);
      if (alive) {
        setGroups(res);
        setLoading(false);
      }
    }, 350);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q, role]);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    const first = groups.find((g) => g.hits.length > 0) ?? groups[0];
    go(first ? first.listTo : `/atmin/gallery?q=${encodeURIComponent(term)}`);
  };

  const any = groups.some((g) => g.hits.length > 0);
  const showPanel = open && q.trim().length >= 2;

  return (
    <div className="a-sr" ref={box}>
      <form onSubmit={submit} role="search">
        <Search size={16} />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Cari artikel, galeri, arsip…"
          aria-label="Cari artikel, galeri, arsip"
          aria-expanded={showPanel}
          autoComplete="off"
        />
      </form>
      {showPanel && (
        <div className="a-md" style={{ display: "block", left: 0, right: "auto", width: "min(440px, 90vw)" }} role="listbox">
          {loading && <div className="a-mh">Mencari…</div>}
          {!loading && !any && <div className="a-mh">Tidak ada hasil untuk "{q.trim()}"</div>}
          {!loading &&
            groups
              .filter((g) => g.hits.length > 0)
              .map((g) => {
                const Icon = g.icon;
                return (
                  <div key={g.key}>
                    <div className="a-mh" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon size={14} />
                      <b style={{ display: "inline" }}>{g.label}</b>
                      <button type="button" className="a-link" style={{ marginLeft: "auto" }} onClick={() => go(g.listTo)}>
                        Lihat semua
                      </button>
                    </div>
                    {g.hits.map((h) => (
                      <button key={h.key} type="button" className="a-menu-link" onClick={() => go(h.to)}>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title}</span>
                          <small>{h.meta}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
        </div>
      )}
    </div>
  );
};

export default AdminSearch;
