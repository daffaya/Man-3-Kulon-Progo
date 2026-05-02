/**
 * @fileoverview CmsLayout — layout wrapper for all CMS admin pages.
 *
 * Wraps AdminLayout (header) and adds a two-column layout:
 * - Left: collapsible sidebar with CMS page navigation
 * - Right: main content area
 *
 * On mobile, sidebar becomes a slide-in drawer triggered by a toggle button.
 * Active route is highlighted in the sidebar automatically.
 */

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Phone,
  BookOpen,
  Eye,
  Users,
  Building,
  Handshake,
  Briefcase,
  GraduationCap,
  UserCheck,
  Shield,
  MessageSquare,
  ClipboardList,
  LayoutGrid,
  FileText,
  Settings,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeft,
} from "lucide-react";
import AdminLayout from "./AdminLayout";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

/** Single item in the CMS sidebar. */
interface CmsNavItem {
  /** Display label */
  label: string;
  /** Route path */
  to: string;
  /** Icon element */
  icon: React.ReactNode;
  /** Optional group this item belongs to */
  group: string;
}

interface CmsLayoutProps {
  children: React.ReactNode;
  /** Optional page title shown above content */
  title?: string;
}

// ─────────────────────────────────────────────
// Navigation config
// ─────────────────────────────────────────────

/** All CMS-editable pages grouped by category. */
const CMS_NAV_ITEMS: CmsNavItem[] = [
  // General
  {
    label: "Semua Halaman",
    to: "/atmin/cms",
    icon: <LayoutGrid size={16} />,
    group: "Umum",
  },

  // Homepage & components
  {
    label: "Homepage",
    to: "/atmin/cms/home",
    icon: <Home size={16} />,
    group: "Halaman Utama",
  },
  {
    label: "Kontak",
    to: "/atmin/cms/kontak",
    icon: <Phone size={16} />,
    group: "Halaman Utama",
  },

  // Profile pages
  {
    label: "Sejarah",
    to: "/atmin/cms/sejarah",
    icon: <BookOpen size={16} />,
    group: "Profil",
  },
  {
    label: "Visi & Misi",
    to: "/atmin/cms/visi-misi",
    icon: <Eye size={16} />,
    group: "Profil",
  },
  {
    label: "Kepala Madrasah",
    to: "/atmin/cms/kepala-madrasah",
    icon: <UserCheck size={16} />,
    group: "Profil",
  },
  {
    label: "Struktur Organisasi",
    to: "/atmin/cms/struktur-organisasi",
    icon: <Users size={16} />,
    group: "Profil",
  },
  {
    label: "Sarana & Prasarana",
    to: "/atmin/cms/sarana-prasarana",
    icon: <Building size={16} />,
    group: "Profil",
  },
  {
    label: "Mitra",
    to: "/atmin/cms/mitra",
    icon: <Handshake size={16} />,
    group: "Profil",
  },
  {
    label: "Siswa",
    to: "/atmin/cms/siswa",
    icon: <GraduationCap size={16} />,
    group: "Profil",
  },
  {
    label: "Program Kerja",
    to: "/atmin/cms/program-kerja",
    icon: <Briefcase size={16} />,
    group: "Profil",
  },

  // Layanan
  {
    label: "PMBM",
    to: "/atmin/cms/pmbm",
    icon: <ClipboardList size={16} />,
    group: "Layanan",
  },
  {
    label: "Zona Integritas",
    to: "/atmin/cms/zona-integritas",
    icon: <Shield size={16} />,
    group: "Layanan",
  },
  {
    label: "SEDUM",
    to: "/atmin/cms/sedum",
    icon: <MessageSquare size={16} />,
    group: "Layanan",
  },
  {
    label: "PTSP",
    to: "/atmin/cms/ptsp",
    icon: <FileText size={16} />,
    group: "Layanan",
  },
  {
    label: "Maklumat Pelayanan",
    to: "/atmin/cms/maklumat-pelayanan",
    icon: <Settings size={16} />,
    group: "Layanan",
  },

  // Web App
  {
    label: "Web App",
    to: "/atmin/cms/web-app",
    icon: <LayoutGrid size={16} />,
    group: "Lainnya",
  },
];

/** Unique groups in order. */
const GROUPS = ["Umum", "Halaman Utama", "Profil", "Layanan", "Lainnya"];

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/**
 * Single sidebar nav link with active state.
 * @param {object} props
 * @param {CmsNavItem} props.item - Nav item data
 * @param {string} props.currentPath - Current URL pathname
 * @param {() => void} [props.onNavigate] - Called after navigation (e.g. close mobile drawer)
 */
const SidebarLink: React.FC<{
  item: CmsNavItem;
  currentPath: string;
  onNavigate?: () => void;
}> = ({ item, currentPath, onNavigate }) => {
  const isActive =
    item.to === "/atmin/cms"
      ? currentPath === "/atmin/cms"
      : currentPath === item.to;

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
        isActive
          ? "bg-accent/10 text-accent font-medium"
          : "text-secondary hover:text-foreground hover:bg-semibackground"
      }`}
    >
      <span
        className={`flex-shrink-0 ${isActive ? "text-accent" : "text-secondary group-hover:text-foreground"}`}
      >
        {item.icon}
      </span>
      <span className="truncate">{item.label}</span>
      {isActive && (
        <ChevronRight size={12} className="ml-auto text-accent flex-shrink-0" />
      )}
    </Link>
  );
};

/**
 * Sidebar content — shared between desktop and mobile drawer.
 * @param {object} props
 * @param {string} props.currentPath - Current URL pathname
 * @param {() => void} [props.onNavigate] - Called after link click
 */
const SidebarContent: React.FC<{
  currentPath: string;
  onNavigate?: () => void;
}> = ({ currentPath, onNavigate }) => (
  <nav className="flex flex-col gap-6 p-4">
    {GROUPS.map((group) => {
      const items = CMS_NAV_ITEMS.filter((item) => item.group === group);
      return (
        <div key={group}>
          {group !== "Umum" && (
            <p className="text-xs font-semibold text-secondary/60 uppercase tracking-wider px-3 mb-2">
              {group}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {items.map((item) => (
              <SidebarLink
                key={item.to}
                item={item}
                currentPath={currentPath}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      );
    })}
  </nav>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

/**
 * CmsLayout — wraps all CMS admin editor pages.
 *
 * Layout structure:
 * ```
 * AdminLayout (header)
 * └── flex row
 *     ├── Sidebar (desktop: fixed width, mobile: drawer)
 *     └── Main content
 * ```
 *
 * @param {CmsLayoutProps} props
 */
const CmsLayout: React.FC<CmsLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname]);

  return (
    <AdminLayout>
      <div className="flex min-h-[calc(100vh-4rem)] relative">
        {/* ── Desktop Sidebar ── */}
        <aside
          className={`hidden md:flex flex-col flex-shrink-0 border-r border-border bg-background transition-all duration-300 overflow-hidden ${
            isSidebarOpen ? "w-60" : "w-0"
          }`}
        >
          <div className="w-60 flex flex-col h-full">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Settings size={15} className="text-accent" />
                <span className="text-sm font-semibold text-foreground">
                  Kelola Konten
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded text-secondary hover:text-foreground hover:bg-semibackground transition-colors"
                aria-label="Tutup sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>

            {/* Back to dashboard */}
            <div className="px-4 py-2 border-b border-border">
              <Link
                to="/atmin"
                className="flex items-center gap-2 text-xs text-secondary hover:text-accent transition-colors"
              >
                <ArrowLeft size={12} />
                Kembali ke Dashboard
              </Link>
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto">
              <SidebarContent currentPath={location.pathname} />
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border bg-background sticky top-16 z-30">
            {/* Toggle sidebar (desktop) */}
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-secondary hover:text-foreground hover:bg-semibackground transition-colors"
                aria-label="Buka sidebar"
              >
                <PanelLeftOpen size={18} />
              </button>
            )}

            {/* Mobile drawer toggle */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-secondary hover:text-foreground hover:bg-semibackground transition-colors border border-border"
              aria-label="Buka navigasi CMS"
            >
              <Settings size={14} />
              <span>Halaman</span>
            </button>

            {/* Page title */}
            {title && (
              <h1 className="text-base font-semibold text-foreground truncate">
                {title}
              </h1>
            )}
          </div>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>

        {/* ── Mobile Drawer ── */}
        {isMobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setIsMobileDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <div className="fixed top-16 left-0 bottom-0 z-50 w-72 bg-background border-r border-border shadow-xl md:hidden overflow-y-auto">
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Settings size={15} className="text-accent" />
                  <span className="text-sm font-semibold text-foreground">
                    Kelola Konten
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded text-secondary hover:text-foreground transition-colors"
                  aria-label="Tutup menu"
                >
                  ✕
                </button>
              </div>

              <SidebarContent
                currentPath={location.pathname}
                onNavigate={() => setIsMobileDrawerOpen(false)}
              />
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default CmsLayout;
