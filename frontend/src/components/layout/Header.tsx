import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  FileText,
  Home,
  User,
  Mail,
  Settings,
  AppWindow,
  ChevronDown,
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
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

  // Profile dropdown items
  const profileDropdownItems = [
    { to: "/profil/sejarah", label: "Sejarah" },
    { to: "/profil/visi-misi", label: "Visi Misi" },
    { to: "/profil/struktur-organisasi", label: "Struktur Organisasi" },
    { to: "/profil/kepala-madrasah", label: "Kepala Madrasah" },
    { to: "/profil/guru-pegawai", label: "Guru & Pegawai" },
    { to: "/profil/mitra", label: "Mitra" },
    { to: "/profil/program-kerja", label: "Program Kerja" },
    { to: "/profil/sarana-prasarana", label: "Sarana Prasarana" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white dark:bg-semibackground shadow-md py-2 opacity-95"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/logo.png"
            alt="logo_man3kp"
            className="w-12 h-12 text-accent"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" label="Home" icon={<Home size={18} />} />
          <NavLink to="/blog" label="Blog" icon={<FileText size={18} />} />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className={`flex items-center space-x-1 font-medium transition-colors ${
                location.pathname.startsWith("/profil")
                  ? "text-accent"
                  : "text-gray-700 dark:text-gray-200 hover:text-accent dark:hover:text-accent"
              }`}
            >
              <User size={18} />
              <span>Profil</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isProfileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 z-50">
                {profileDropdownItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink
            to="/webApp"
            label="Web App"
            icon={<AppWindow size={18} />}
          />
          <NavLink to="/contact" label="Kontak" icon={<Mail size={18} />} />
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center md:hidden space-x-4">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-700 dark:text-gray-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <MobileNavLink to="/" label="Home" icon={<Home size={18} />} />
            <MobileNavLink
              to="/blog"
              label="Blog"
              icon={<FileText size={18} />}
            />

            {/* Mobile Profile Dropdown */}
            <div>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center justify-between w-full p-2 text-left text-gray-700 dark:text-gray-200"
              >
                <div className="flex items-center space-x-2">
                  <User size={18} />
                  <span>Profil</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileDropdownOpen && (
                <div className="pl-6 mt-1 space-y-1">
                  {profileDropdownItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block py-2 px-4 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <MobileNavLink
              to="/contact"
              label="Kontak"
              icon={<Mail size={18} />}
            />
            <MobileNavLink
              to="/webApp"
              label="Web App"
              icon={<AppWindow size={18} />}
            />
          </nav>
        </div>
      )}
    </header>
  );
};

interface NavLinkProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== "/" && location.pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`flex items-center space-x-1 font-medium transition-colors ${
        isActive
          ? "text-accent"
          : "text-gray-700 dark:text-gray-200 hover:text-accent dark:hover:text-accent"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const MobileNavLink: React.FC<NavLinkProps> = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== "/" && location.pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 p-2 rounded-md ${
        isActive
          ? "bg-gray-100 dark:bg-gray-800 text-accent"
          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default Header;
