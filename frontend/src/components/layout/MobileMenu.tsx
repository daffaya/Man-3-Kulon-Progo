// src/components/layout/MobileMenu.tsx
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

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  profileItems,
  layananItems,
}) => {
  if (!isOpen) return null;

  return (
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
      </nav>
    </div>
  );
};
