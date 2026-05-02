/**
 * @fileoverview AdminHeader component — improved version.
 *
 * Improvements over previous version:
 * - Always-solid background (no transparent at top — admin pages don't need it)
 * - Active route highlighting in navigation
 * - Breadcrumb indicator showing current section
 * - Horizontal quick-nav for desktop (Dashboard, CMS, back to site)
 * - Cleaner mobile menu with better hierarchy
 * - Extracted sub-components for readability
 * - Fixed event.target type assertion
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Globe,
  FileText,
  Settings,
  X,
  Menu,
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";
import ImageWithFallback from "../ui/ImageWithFallback";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  /** If true, only exact match highlights this item */
  exact?: boolean;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

/** Quick-navigation items shown in the admin header. */
const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    to: "/atmin",
    icon: <LayoutDashboard size={15} />,
    exact: true,
  },
  { label: "Kelola Konten", to: "/atmin/cms", icon: <Settings size={15} /> },
  { label: "Artikel", to: "/atmin/articles", icon: <FileText size={15} /> },
  { label: "Lihat Website", to: "/", icon: <Globe size={15} /> },
];

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/**
 * Avatar element — shows user image or fallback icon.
 * @param {object} props
 * @param {string | null} props.avatarUrl - URL to the user's avatar image
 * @param {string} props.displayName - Name used as alt text
 * @param {string} [props.className] - Additional CSS classes for the wrapper
 */
const UserAvatar: React.FC<{
  avatarUrl: string | null;
  displayName: string;
  className?: string;
}> = ({ avatarUrl, displayName, className = "h-8 w-8" }) => (
  <div
    className={`${className} rounded-full bg-semibackground flex items-center justify-center overflow-hidden ring-2 ring-accent/20`}
  >
    {avatarUrl ? (
      <ImageWithFallback
        src={avatarUrl}
        alt={displayName}
        className="w-full h-full object-cover"
        fallback="/logo.png"
      />
    ) : (
      <User size={16} className="text-secondary" />
    )}
  </div>
);

/**
 * Single desktop navigation link with active state.
 * @param {object} props
 * @param {NavItem} props.item - Navigation item data
 * @param {string} props.currentPath - Current URL pathname
 */
const DesktopNavLink: React.FC<{ item: NavItem; currentPath: string }> = ({
  item,
  currentPath,
}) => {
  const isActive = item.exact
    ? currentPath === item.to
    : currentPath.startsWith(item.to);

  return (
    <Link
      to={item.to}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-accent/10 text-accent"
          : "text-secondary hover:text-foreground hover:bg-semibackground"
      }`}
    >
      {item.icon}
      {item.label}
    </Link>
  );
};

/**
 * Profile dropdown menu shown on desktop.
 * @param {object} props
 * @param {string} props.displayName - Username to display
 * @param {string} props.displayRole - User role to display
 * @param {string | null} props.avatarUrl - User avatar URL
 * @param {() => void} props.onLogout - Logout handler
 * @param {() => void} props.onClose - Close dropdown handler
 */
const ProfileDropdown: React.FC<{
  displayName: string;
  displayRole: string;
  avatarUrl: string | null;
  onLogout: () => void;
  onClose: () => void;
}> = ({ displayName, displayRole, avatarUrl, onLogout, onClose }) => (
  <div className="absolute right-0 mt-2 w-56 card shadow-xl z-50 overflow-hidden">
    {/* User info */}
    <div className="px-4 py-3 border-b border-border flex items-center gap-3">
      <UserAvatar
        avatarUrl={avatarUrl}
        displayName={displayName}
        className="h-10 w-10"
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {displayName}
        </p>
        <p className="text-xs text-secondary capitalize">
          {displayRole.replace("_", " ")}
        </p>
      </div>
    </div>

    {/* Actions */}
    <div className="py-1">
      <Link
        to="/atmin/userProfile"
        onClick={onClose}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-semibackground transition-colors"
      >
        <User size={15} className="text-secondary" />
        Profil Saya
      </Link>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        <LogOut size={15} />
        Keluar
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

/**
 * AdminHeader — fixed header for all admin pages.
 *
 * Features:
 * - Always-solid background (no transparency)
 * - Quick navigation between admin modules
 * - Profile dropdown with user info
 * - Responsive mobile menu
 * - Active route highlighting
 */
const AdminHeader: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const displayName = user?.username || "Admin";
  const displayRole = user?.role || "Administrator";
  const avatarUrl = user?.avatar || null;

  // ── Scroll shadow ──
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Close menus on route change ──
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-background border-b border-border transition-shadow duration-200 ${
          isScrolled ? "shadow-md" : "shadow-none"
        }`}
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link to="/atmin" className="flex items-center gap-2 flex-shrink-0">
              <img src="/logo.png" alt="Logo MAN 3 KP" className="w-8 h-8" />
              <span className="hidden sm:block text-sm font-semibold text-foreground">
                Admin Panel
              </span>
            </Link>

            {/* Divider */}
            <div className="hidden md:block w-px h-5 bg-border" />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {NAV_ITEMS.map((item) => (
                <DesktopNavLink
                  key={item.to}
                  item={item}
                  currentPath={location.pathname}
                />
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 ml-auto">
              <ThemeToggle />

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-semibackground transition-colors"
                  aria-label="Profil pengguna"
                  aria-expanded={isProfileOpen}
                >
                  <UserAvatar avatarUrl={avatarUrl} displayName={displayName} />
                  <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`hidden md:block text-secondary transition-transform duration-200 ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <ProfileDropdown
                    displayName={displayName}
                    displayRole={displayRole}
                    avatarUrl={avatarUrl}
                    onLogout={handleLogout}
                    onClose={() => setIsProfileOpen(false)}
                  />
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-lg text-secondary hover:text-foreground hover:bg-semibackground transition-colors"
                aria-label="Toggle menu navigasi"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-background border-b border-border shadow-lg md:hidden">
          {/* User info */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <UserAvatar
              avatarUrl={avatarUrl}
              displayName={displayName}
              className="h-10 w-10"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {displayName}
              </p>
              <p className="text-xs text-secondary capitalize">
                {displayRole.replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="py-2">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? "text-accent bg-accent/5"
                      : "text-foreground hover:bg-semibackground"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="border-t border-border py-2">
            <Link
              to="/atmin/userProfile"
              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-semibackground transition-colors"
            >
              <User size={15} className="text-secondary" />
              Profil Saya
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut size={15} />
              Keluar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;
