/**
 * @fileoverview AdminHeader — top bar admin (sesuai mockup v2): tombol menu (tablet/mobile),
 * pencarian artikel, tombol "Lihat Website", notifikasi, tema, dan menu akun.
 */
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  ExternalLink,
  KeyRound,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import {
  ARTICLE_ROLES,
  relativeDay,
  useAdminSummary,
} from "../../hooks/useAdminSummary";
import { CMS_NEEDS_CHECK } from "../../pages/admin/cms/cmsPages";
import AdminSearch from "./AdminSearch";

interface Props {
  onMenu: () => void;
}

/** Dropdown kecil: tutup saat klik di luar, Escape, atau pindah halaman. */
const useDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, ref };
};

const AdminHeader: React.FC<Props> = ({ onMenu }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const summary = useAdminSummary();
  const bell = useDropdown();
  const account = useDropdown();

  const role = user?.role ?? "";
  const canArticles = ARTICLE_ROLES.includes(role);
  const displayName = user?.username || "Admin";
  const roleLabel = role ? role.replace(/_/g, " ") : "Administrator";

  const notifs: {
    key: string;
    to: string;
    tone: "wn" | "in" | "ok";
    badge: string;
    text: string;
    meta: string;
  }[] = [];
  if (canArticles && summary.drafts > 0) {
    notifs.push({
      key: "drafts",
      to: "/atmin/articles",
      tone: "wn",
      badge: "Draf",
      text: `${summary.drafts} draf menunggu ditinjau`,
      meta: "Artikel",
    });
  }
  if (role === "super_admin" && CMS_NEEDS_CHECK.length > 0) {
    notifs.push({
      key: "cms",
      to: "/atmin/cms",
      tone: "in",
      badge: "Cek",
      text: `${CMS_NEEDS_CHECK.length} halaman website perlu dicek`,
      meta: "Halaman Website",
    });
  }
  const latest = summary.latestPublished[0];
  if (canArticles && latest) {
    notifs.push({
      key: "latest",
      to: "/atmin/articles",
      tone: "ok",
      badge: "Info",
      text: `Artikel "${latest.title.length > 34 ? latest.title.slice(0, 34) + "…" : latest.title}" terbit`,
      meta: `Artikel · ${relativeDay(latest.publishedDate)}`,
    });
  }
  const attention = notifs.filter((n) => n.tone !== "ok").length;

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  return (
    <header className="a-tp">
      <button
        type="button"
        className="a-ic a-hb"
        onClick={onMenu}
        aria-label="Buka menu"
        aria-controls="admin-sidebar"
      >
        <Menu size={18} />
      </button>

      <AdminSearch />
      <div className="a-sp" />

      <a
        className="a-btn a-hm"
        href="/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={16} />
        Lihat Website
      </a>

      <div className={`a-dd${bell.open ? " a-open" : ""}`} ref={bell.ref}>
        <button
          type="button"
          className="a-ic"
          aria-label="Notifikasi"
          aria-expanded={bell.open}
          onClick={() => {
            account.setOpen(false);
            bell.setOpen((v) => !v);
          }}
        >
          <Bell size={18} />
          {attention > 0 && <span className="a-pip" />}
        </button>
        <div className="a-md" style={{ width: 310 }}>
          <div className="a-mh">
            <b>Notifikasi</b>
            {attention > 0 ? `${attention} perlu perhatian` : "Tidak ada yang perlu ditindaklanjuti"}
          </div>
          {notifs.map((n) => (
            <Link key={n.key} to={n.to} className="a-menu-link">
              <span className={`a-b a-${n.tone}`}>{n.badge}</span>
              <span>
                {n.text}
                <small>{n.meta}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="a-ic"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className={`a-dd${account.open ? " a-open" : ""}`} ref={account.ref}>
        <button
          type="button"
          className="a-btn"
          aria-label="Menu akun"
          aria-expanded={account.open}
          onClick={() => {
            bell.setOpen(false);
            account.setOpen((v) => !v);
          }}
        >
          <span className="a-av">{displayName.charAt(0).toUpperCase()}</span>
          <span className="a-hm">{displayName}</span>
          <ChevronDown size={16} />
        </button>
        <div className="a-md">
          <div className="a-mh">
            <b>{displayName}</b>
            <span style={{ textTransform: "capitalize" }}>{roleLabel}</span>
          </div>
          <Link to="/atmin/userProfile" className="a-menu-link">
            <User size={16} />
            Profil saya
          </Link>
          <Link to="/atmin/userProfile" className="a-menu-link">
            <KeyRound size={16} />
            Ganti password
          </Link>
          <button type="button" className="a-menu-link" onClick={handleLogout}>
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
