import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  Image,
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileMobileDropdownOpen, setIsProfileMobileDropdownOpen] =
    useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setIsProfileMobileDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profileDropdownItems = [
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[rgb(var(--color-background))] shadow-md py-2 opacity-95"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="logo_man3kp" className="w-12 h-12" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" label="Home" icon={<Home size={18} />} />
          <NavLink to="/berita" label="Berita" icon={<FileText size={18} />} />
          <NavLink to="/galeri" label="Galeri" icon={<Image size={18} />} />

          {/* Profile Dropdown */}
          <ProfileDropdown
            dropdownRef={dropdownRef}
            isOpen={isProfileDropdownOpen}
            toggle={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            items={profileDropdownItems}
          />

          <NavLink
            to="/webApp"
            label="Web App"
            icon={<AppWindow size={18} />}
          />

          {/* Alumni */}
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <MobileMenu
          profileItems={profileDropdownItems}
          isProfileOpen={isProfileMobileDropdownOpen}
          toggleProfile={() =>
            setIsProfileMobileDropdownOpen(!isProfileMobileDropdownOpen)
          }
        />
      )}
    </header>
  );
};

/* ===================== COMPONENTS ===================== */

interface NavLinkProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  isMobile?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, label, icon, isMobile }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== "/" && location.pathname.startsWith(to));

  const baseClasses =
    "flex items-center space-x-2 font-medium transition-colors";
  const activeClasses = isActive
    ? "text-[rgb(var(--color-accent))]"
    : "text-foreground hover:text-[rgb(var(--color-accent))]";

  const mobileClasses = isMobile
    ? "p-2 rounded-md hover:bg-[rgb(var(--color-secondary-hover))]"
    : "";

  return (
    <Link
      to={to}
      className={`${baseClasses} ${activeClasses} ${mobileClasses}`}
    >
      {icon} <span>{label}</span>
    </Link>
  );
};

interface ProfileDropdownProps {
  dropdownRef: React.RefObject<HTMLDivElement>;
  isOpen: boolean;
  toggle: () => void;
  items: { to: string; label: string }[];
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  dropdownRef,
  isOpen,
  toggle,
  items,
}) => (
  <div className="relative" ref={dropdownRef}>
    <button
      onClick={toggle}
      className={`flex items-center space-x-1 font-medium transition-colors text-foreground hover:text-[rgb(var(--color-accent))]`}
    >
      <User size={18} />
      <span>Profil</span>
      <ChevronDown
        size={16}
        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>

    {isOpen && (
      <div className="absolute top-full left-0 mt-2 w-56 card shadow-lg py-1 z-50">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="block px-4 py-2 text-sm text-foreground hover:bg-[rgb(var(--color-secondary-hover))]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    )}
  </div>
);

interface MobileMenuProps {
  profileItems: { to: string; label: string }[];
  isProfileOpen: boolean;
  toggleProfile: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  profileItems,
  isProfileOpen,
  toggleProfile,
}) => (
  <div className="md:hidden card shadow-lg">
    <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
      <NavLink to="/" label="Home" icon={<Home size={18} />} isMobile />
      <NavLink
        to="/berita"
        label="Berita"
        icon={<FileText size={18} />}
        isMobile
      />
      <NavLink
        to="/galeri"
        label="Galeri"
        icon={<Image size={18} />}
        isMobile
      />
      {/* Profile Dropdown Mobile */}
      <div>
        <button
          onClick={toggleProfile}
          className="flex items-center justify-between w-full p-2 text-left text-foreground"
        >
          <div className="flex items-center space-x-2">
            <User size={18} />
            <span>Profil</span>
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform ${
              isProfileOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isProfileOpen && (
          <div className="pl-6 mt-1 space-y-1">
            {profileItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block py-2 px-4 text-sm text-foreground hover:bg-[rgb(var(--color-secondary-hover))] rounded"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Alumni mobile */}
      <NavLink
        to="/alumni"
        label="Alumni"
        icon={<GraduationCap size={18} />}
        isMobile
      />

      <NavLink
        to="/contact"
        label="Kontak"
        icon={<Mail size={18} />}
        isMobile
      />
      <NavLink
        to="/webApp"
        label="Web App"
        icon={<AppWindow size={18} />}
        isMobile
      />
    </nav>
  </div>
);

export default Header;
