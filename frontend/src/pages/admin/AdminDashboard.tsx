/**
 * @fileoverview Dashboard admin (mockup v2): pusatnya menulis artikel — tombol "Tulis Artikel",
 * tiga angka ringkas, daftar draf untuk dilanjutkan, artikel terbaru, pintasan, dan
 * halaman website yang perlu dicek. Widget artikel hanya untuk role yang boleh mengelola artikel.
 */
import React from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  ChevronRight,
  FilePen,
  Image as ImageIcon,
  Images,
  Newspaper,
  PanelsTopLeft,
  Plus,
  Send,
  Upload,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { useAuth } from "../../contexts/AuthContext";
import {
  ARTICLE_ROLES,
  relativeDay,
  shortDate,
  useAdminSummary,
} from "../../hooks/useAdminSummary";
import { CMS_NEEDS_CHECK } from "./cms/cmsPages";

interface Shortcut {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: string[];
}

const SHORTCUTS: Shortcut[] = [
  { label: "Tambah album galeri", to: "/atmin/gallery/new", icon: Images },
  { label: "Unggah arsip dokumen", to: "/atmin/uploadArchive", icon: Upload, roles: ["arsiparis"] },
  { label: "Edit halaman website", to: "/atmin/cms", icon: PanelsTopLeft, roles: [] },
  { label: "Kelola guru & staf", to: "/atmin/staff", icon: Users, roles: [] },
];

const greeting = (h: number) =>
  h < 11 ? "pagi" : h < 15 ? "siang" : h < 18 ? "sore" : "malam";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const s = useAdminSummary();
  const role = user?.role ?? "";
  const canArticles = ARTICLE_ROLES.includes(role);
  const isSuper = role === "super_admin";
  const now = new Date();
  const dateLabel = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const delta = s.publishedThisMonth - s.publishedLastMonth;
  const stats: { icon: LucideIcon; label: string; value: string; sub: React.ReactNode }[] = [
    {
      icon: Send,
      label: "Terbit bulan ini",
      value: String(s.publishedThisMonth),
      sub:
        delta === 0 ? (
          "Sama seperti bulan lalu"
        ) : (
          <>
            <span className={delta > 0 ? "a-up" : undefined}>
              {delta > 0 ? "+" : "−"}
              {Math.abs(delta)}
            </span>{" "}
            dari bulan lalu
          </>
        ),
    },
    {
      icon: FilePen,
      label: "Draf",
      value: String(s.drafts),
      sub: s.draftList[0]
        ? `Terakhir disunting ${relativeDay(s.draftList[0].lastModified)}`
        : "Tidak ada draf",
    },
    {
      icon: Newspaper,
      label: "Total artikel",
      value: String(s.total),
      sub: s.lastPublishedDate
        ? `Terakhir terbit ${shortDate(s.lastPublishedDate)}`
        : "Belum ada artikel terbit",
    },
  ];

  const shortcuts = SHORTCUTS.filter(
    (x) => isSuper || !x.roles || x.roles.includes(role),
  );

  return (
    <AdminLayout>
      <div className="a-pg">
        <div className="a-hd">
          <div>
            <h1 className="a-h1">
              Selamat {greeting(now.getHours())}, {user?.username || "Admin"}
            </h1>
            <p className="a-sub">{dateLabel}</p>
          </div>
          {canArticles && (
            <Link to="/atmin/articles/new" className="a-btn a-p">
              <Plus size={18} />
              Tulis Artikel
            </Link>
          )}
        </div>

        {canArticles && (
          <div className="a-g a-g3">
            {stats.map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="a-cd a-st">
                <div className="a-l">
                  <Icon size={18} />
                  {label}
                </div>
                {s.loading ? (
                  <>
                    <div className="a-sk" style={{ width: 56, height: 28, margin: "10px 0 8px" }} />
                    <div className="a-sk" style={{ width: "70%" }} />
                  </>
                ) : (
                  <>
                    <div className="a-v">{s.error ? "—" : value}</div>
                    <div className="a-d">{s.error ? "Gagal memuat data" : sub}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={canArticles ? "a-g a-g2" : "a-g"} style={canArticles ? undefined : { maxWidth: 520 }}>
          {canArticles && (
            <div className="a-g" style={{ alignContent: "start" }}>
              <section className="a-cd a-z">
                <div className="a-gh">
                  <h2 className="a-h2">Lanjutkan menulis</h2>
                  <span className="a-b a-wn">{s.drafts} draf</span>
                </div>
                {s.loading ? (
                  [0, 1].map((i) => (
                    <div key={i} className="a-cr">
                      <div className="a-sk" style={{ width: "60%" }} />
                    </div>
                  ))
                ) : s.draftList.length === 0 ? (
                  <div className="a-em" style={{ padding: "28px 16px" }}>
                    <FilePen />
                    <b>Tidak ada draf</b>
                    Semua tulisan sudah terbit.
                  </div>
                ) : (
                  s.draftList.slice(0, 3).map((a) => (
                    <div key={a.id} className="a-cr">
                      <span className="a-th a-wn"><FilePen size={18} /></span>
                      <p>
                        <b>{a.title}</b>
                        <span>
                          {a.category ?? "Tanpa kategori"} · disunting {shortDate(a.lastModified)}
                        </span>
                      </p>
                      <Link to={`/atmin/articles/${a.id}/edit`} className="a-btn a-sm">
                        Lanjutkan
                      </Link>
                    </div>
                  ))
                )}
              </section>

              <section className="a-cd a-z">
                <div className="a-gh">
                  <h2 className="a-h2">Artikel terbaru</h2>
                  <Link to="/atmin/articles" className="a-btn a-sm">Lihat semua</Link>
                </div>
                {s.loading ? (
                  [0, 1, 2].map((i) => (
                    <div key={i} className="a-cr">
                      <div className="a-sk" style={{ width: "70%" }} />
                    </div>
                  ))
                ) : s.latestPublished.length === 0 ? (
                  <div className="a-em" style={{ padding: "28px 16px" }}>
                    <Newspaper />
                    <b>Belum ada artikel terbit</b>
                  </div>
                ) : (
                  s.latestPublished.map((a) => (
                    <div key={a.id} className="a-cr">
                      <span className="a-th">
                        {a.coverImage ? <img src={a.coverImage} alt="" loading="lazy" /> : <ImageIcon size={18} />}
                      </span>
                      <p>
                        <b>{a.title}</b>
                        <span>
                          {a.category ?? "Tanpa kategori"} · {shortDate(a.publishedDate)}
                        </span>
                      </p>
                      <span className="a-b a-ok a-hm">Terbit</span>
                      <Link to={`/atmin/articles/${a.id}/edit`} className="a-btn a-sm">Edit</Link>
                    </div>
                  ))
                )}
              </section>
            </div>
          )}

          <div className="a-g" style={{ alignContent: "start" }}>
            {shortcuts.length > 0 && (
              <section className="a-cd a-z">
                <div className="a-gh"><h2 className="a-h2">Pintasan</h2></div>
                {shortcuts.map(({ label, to, icon: Icon }) => (
                  <Link key={to} to={to} className="a-cr" style={{ width: "100%" }}>
                    <span className="a-th"><Icon size={18} /></span>
                    <p><b>{label}</b></p>
                    <ChevronRight size={18} />
                  </Link>
                ))}
              </section>
            )}

            {isSuper && (
              <section className="a-cd a-z">
                <div className="a-gh">
                  <h2 className="a-h2">Halaman website perlu dicek</h2>
                  <span className="a-b a-wn">{CMS_NEEDS_CHECK.length}</span>
                </div>
                {CMS_NEEDS_CHECK.map((p) => (
                  <div key={p.to} className="a-cr">
                    <p>
                      <b>{p.label}</b>
                      <span>{p.badge}</span>
                    </p>
                    <Link to={p.to} className="a-btn a-sm">Edit</Link>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>

        {!canArticles && shortcuts.length === 0 && (
          <div className="a-cd">
            <div className="a-em">
              <Archive />
              <b>Belum ada pintasan</b>
              Gunakan menu di samping untuk membuka fitur yang tersedia untuk akun Anda.
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
