/**
 * @fileoverview AdminSidebar — navigasi utama admin (sesuai mockup v2).
 * Item disaring menurut role. Presensi hanya untuk guru_bk/super_admin;
 * inventaris sengaja tidak ditampilkan (belum ada).
 */
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  Images,
  PanelsTopLeft,
  Users,
  Archive,
  UserPlus,
  GraduationCap,
  ClipboardCheck,
  ShieldCheck,
  CalendarRange,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useAdminSummary } from "../../hooks/useAdminSummary";
import { apiFetch } from "../../lib/api";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Role yang boleh melihat item (super_admin selalu boleh). Kosong = semua role. */
  roles?: string[];
  match: (path: string) => boolean;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const starts = (...prefixes: string[]) => (p: string) =>
  prefixes.some((x) => p === x || p.startsWith(x + "/"));

/** Tahun ajaran & semester aktif berdasarkan tanggal (Juli–Des = Ganjil). */
const academicPeriod = (now = new Date()) => {
  const y = now.getFullYear();
  const ganjil = now.getMonth() >= 6;
  return `TA ${ganjil ? y : y - 1}/${ganjil ? y + 1 : y} · Semester ${ganjil ? "Ganjil" : "Genap"}`;
};

interface Props {
  open: boolean;
}

const AdminSidebar: React.FC<Props> = ({ open }) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const summary = useAdminSummary();
  const [online, setOnline] = useState<boolean>(true);

  // Status layanan: tampil "normal" (sesuai mockup) kecuali pengecekan gagal dua kali berturut-turut.
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = (attempt: number) => {
      apiFetch("/archives/categories")
        .then(() => alive && setOnline(true))
        .catch(() => {
          if (!alive) return;
          if (attempt >= 2) setOnline(false);
          else timer = setTimeout(() => check(attempt + 1), 4000);
        });
    };
    check(1);
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const role = user?.role ?? "";
  const groups: NavGroup[] = [
    {
      label: "Beranda",
      items: [
        {
          label: "Dashboard",
          to: "/atmin",
          icon: LayoutDashboard,
          match: (p) => p === "/atmin" || p === "/atmin/",
        },
      ],
    },
    {
      label: "Website",
      items: [
        {
          label: "Artikel",
          to: "/atmin/articles",
          icon: Newspaper,
          roles: ["jurnalis"],
          match: starts("/atmin/articles", "/atmin/category"),
          badge: summary.drafts,
        },
        {
          label: "Galeri",
          to: "/atmin/gallery",
          icon: Images,
          match: starts("/atmin/gallery"),
        },
        {
          label: "Halaman Website",
          to: "/atmin/cms",
          icon: PanelsTopLeft,
          roles: [],
          match: starts("/atmin/cms"),
        },
      ],
    },
    {
      label: "Data Sekolah",
      items: [
        {
          label: "Guru & Staf",
          to: "/atmin/staff",
          icon: Users,
          roles: [],
          match: starts("/atmin/staff"),
        },
        {
          label: "Arsip Dokumen",
          to: "/archives",
          icon: Archive,
          roles: ["arsiparis"],
          match: starts("/archives", "/atmin/archives", "/atmin/uploadArchive"),
        },
        {
          label: "PMBM",
          to: "/atmin/pmbm",
          icon: UserPlus,
          match: starts("/atmin/pmbm"),
        },
        {
          label: "Presensi",
          to: "/atmin/presensi",
          icon: ClipboardCheck,
          roles: ["guru_bk"],
          match: starts("/atmin/presensi"),
        },
        {
          label: "Cek Kelulusan",
          to: "/atmin/kelulusan",
          icon: GraduationCap,
          roles: ["guru_bk"],
          match: starts("/atmin/kelulusan"),
        },
      ],
    },
    {
      label: "Sistem",
      items: [
        {
          label: "Manajemen User",
          to: "/atmin/users",
          icon: ShieldCheck,
          roles: [],
          match: starts("/atmin/users"),
        },
        {
          label: "Tahun Ajaran",
          to: "/atmin/tahun-ajaran",
          icon: CalendarRange,
          roles: [],
          match: starts("/atmin/tahun-ajaran"),
        },
      ],
    },
  ];

  const canSee = (item: NavItem) =>
    role === "super_admin" || !item.roles || item.roles.includes(role);

  return (
    <aside
      id="admin-sidebar"
      className={`a-sb${open ? " a-open" : ""}`}
      aria-label="Navigasi utama"
    >
      <Link to="/atmin" className="a-br">
        <span className="a-lg" style={{ overflow: "hidden", background: "var(--sf2)" }}>
          <img src="/logo.png" alt="" width={36} height={36} />
        </span>
        <span>
          Admin Panel
          <small>MAN 3 Kulon Progo</small>
        </span>
      </Link>

      <nav>
        {groups.map((g) => {
          const items = g.items.filter(canSee);
          if (items.length === 0) return null;
          return (
            <div key={g.label}>
              <div className="a-gl">{g.label}</div>
              {items.map((item) => {
                const active = item.match(pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`a-nv${active ? " a-on" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                    {item.label}
                    {item.badge ? (
                      <span className="a-n" title={`${item.badge} draf`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="a-sf">
        <div>
          <span
            className="a-dot"
            style={online ? undefined : { background: "var(--dg)" }}
          />
          {online ? "Semua layanan normal" : "Layanan bermasalah"}
        </div>
        <div style={{ marginTop: 4 }}>{academicPeriod()}</div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
