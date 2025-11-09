// src/components/ui/NavLink.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

interface NavLinkProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  isMobile?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({
  to,
  label,
  icon,
  isMobile = false,
}) => {
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
