/**
 * @fileoverview Header component with navigation and theme toggle.
 * This component provides a responsive header for the website with navigation links,
 * dropdown menus for profile and services sections, and a mobile menu for smaller screens.
 * It adapts its appearance based on scroll position and includes a theme toggle button.
 */

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  FileText,
  Home,
  User,
  GraduationCap,
  Mail,
  AppWindow,
  Image,
  Layers,
  FileCheck, // <-- PERUBAHAN 1: Tambahkan import ikon FileCheck
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { NavLink } from "../ui/NavLink";
import { Dropdown, DropdownItem } from "../ui/Dropdown";
import { MobileMenu } from "./MobileMenu";

/**
 * Header component with navigation and theme toggle.
 * Provides a responsive header with navigation links, dropdown menus, and a mobile menu.
 * Adapts appearance based on scroll position and includes a theme toggle button.
 *
 * @returns {JSX.Element} The rendered header component
 */
const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  /**
   * Navigation items for the Profile dropdown menu
   */
  const profileDropdownItems: DropdownItem[] = [
    { to: "/profile/sejarah", label: "Sejarah" },
    { to: "/profile/visi-misi", label: "Visi Misi" },
    { to: "/profile/struktur-organisasi", label: "Struktur Organisasi" },
    { to: "/profile/kepala-madrasah", label: "Kepala Madrasah" },
    { to: "/profile/guru-staf", label: "Guru & Staf" },
    { to: "/profile/siswa", label: "Siswa" },
    { to: "/profile/mitra", label: "Mitra" },
    { to: "/profile/program-kerja", label: "Program Kerja" },
    { to: "/profile/sarana-prasarana", label: "Sarana Prasarana" },
  ];

  /**
   * Navigation items for the Services dropdown menu
   */
  const layananDropdownItems: DropdownItem[] = [
    { to: "/layanan/zona-integritas", label: "Zona Integritas" },
    { to: "/layanan/ppdb", label: "PPDB" },
    {
      to: "https://sites.google.com/view/bkman3kpberkah/",
      label: "Bimbingan Konseling",
      openInNewTab: true,
    },
    { to: "/layanan/sedum", label: "Sedum" },
    { to: "/layanan/ptsp", label: "PTSP Online" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location.pathname]);

  /**
   * Determines the CSS classes for the header based on scroll state
   * @returns {string} The CSS classes for the header element
   */
  const getHeaderClasses = () => {
    const baseClasses =
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300";
    const scrolledClasses =
      "bg-[rgb(var(--color-background))] shadow-md py-2 opacity-95";

    const transparentClasses =
      window.innerWidth < 768
        ? "bg-[rgb(var(--color-background))] py-4"
        : "bg-transparent py-4";

    return `${baseClasses} ${
      isScrolled ? scrolledClasses : transparentClasses
    }`;
  };

  return (
    <>
      <header className={getHeaderClasses()}>
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="logo_man3kp" className="w-12 h-12" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" label="Home" icon={<Home size={18} />} />
            <NavLink
              to="/berita"
              label="Berita"
              icon={<FileText size={18} />}
            />
            <NavLink to="/galeri" label="Galeri" icon={<Image size={18} />} />

            <Dropdown
              label="Profil"
              icon={<User size={18} />}
              items={profileDropdownItems}
            />

            <Dropdown
              label="Layanan"
              icon={<Layers size={18} />}
              items={layananDropdownItems}
            />

            <NavLink
              to="/webApp"
              label="Web App"
              icon={<AppWindow size={18} />}
            />
            <NavLink
              to="/alumni"
              label="Alumni"
              icon={<GraduationCap size={18} />}
            />
            <NavLink to="/contact" label="Kontak" icon={<Mail size={18} />} />
            <ThemeToggle />
          </nav>

          {/* Mobile Toggle */}
          <div className="flex items-center md:hidden space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        profileItems={profileDropdownItems}
        layananItems={layananDropdownItems}
      />
    </>
  );
};

export default Header;
