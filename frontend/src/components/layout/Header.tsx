import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
  }, [location.pathname]);

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
          <NavLink to="/Profile" label="Tentang" icon={<User size={18} />} />
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
            <MobileNavLink
              to="/Profile"
              label="Tentang"
              icon={<User size={18} />}
            />
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
