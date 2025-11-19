/**
 * @fileoverview NavLink component for rendering a styled navigation link.
 * This component highlights the active link based on the current URL and supports both desktop and mobile views.
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";

interface NavLinkProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  isMobile?: boolean;
}

/**
 * Component that renders a navigation link with active state styling.
 * It uses the current location from the router to determine if the link is active and applies appropriate CSS classes.
 * @param {string} to - The destination path.
 * @param {string} label - The text to display for the link.
 * @param {React.ReactNode} [icon] - Optional icon to display next to the label.
 * @param {boolean} [isMobile=false] - Flag to apply mobile-specific styling.
 */
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
