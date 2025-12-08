/**
 * @fileoverview MobileMenu component for responsive navigation on mobile devices.
 * This component provides a collapsible navigation menu with various links and dropdowns
 * that is displayed on smaller screens when the hamburger menu is toggled.
 */

import React from "react";
import { NavLink } from "../ui/NavLink";
import { Dropdown, DropdownItem } from "../ui/Dropdown";
import {
  Home,
  FileText,
  Image,
  User,
  Layers,
  GraduationCap,
  Mail,
  AppWindow,
} from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  profileItems: DropdownItem[];
  layananItems: DropdownItem[];
}

/**
 * MobileMenu component that displays a responsive navigation menu for mobile devices.
 * Renders a set of navigation links and dropdown menus when the menu is open.
 *
 * @param {MobileMenuProps} props - The component props
 * @returns {JSX.Element | null} The rendered mobile menu or null if not open
 */
export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  profileItems,
  layananItems,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`md:hidden fixed top-16 left-0 right-0 z-40 bg-background card shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto transition-transform duration-300 ${
        isOpen ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {" "}
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

        <Dropdown
          label="Profil"
          icon={<User size={18} />}
          items={profileItems}
          isMobile
        />

        <Dropdown
          label="Layanan"
          icon={<Layers size={18} />}
          items={layananItems}
          isMobile
        />

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
      </nav>
    </div>
  );
};
