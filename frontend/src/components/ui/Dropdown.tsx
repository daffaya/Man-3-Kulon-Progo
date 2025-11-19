/**
 * @fileoverview Reusable Dropdown component for navigation menus.
 * This component renders a dropdown button with a list of navigation links.
 * It supports both desktop and mobile layouts and uses a custom hook
 * (`useDropdown`) to manage its open/close state and click-outside-to-close functionality.
 */

import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useDropdown } from "../../hooks/useDropdown";

/**
 * Represents a single item within the dropdown menu.
 */
export type DropdownItem = {
  /** The navigation path for the link. */
  to: string;
  /** The display text for the link. */
  label: string;
};

/**
 * Props for the Dropdown component.
 */
interface DropdownProps {
  /** The text label for the dropdown button. */
  label: string;
  /** The icon element to display next to the label. */
  icon: React.ReactNode;
  /** An array of items to display in the dropdown menu. */
  items: DropdownItem[];
  /** Optional flag to apply mobile-specific styles. */
  isMobile?: boolean;
}

/**
 * A dropdown menu component that displays a list of navigation links.
 * The component can toggle its visibility and has different styling
 * for desktop and mobile views. It handles clicks outside to close the menu.
 * @param {DropdownProps} props - The props for the component.
 */
export const Dropdown: React.FC<DropdownProps> = ({
  label,
  icon,
  items,
  isMobile = false,
}) => {
  const { isOpen, toggle, dropdownRef } = useDropdown();

  const buttonClasses = isMobile
    ? "flex items-center justify-between w-full p-2 text-left text-foreground"
    : "flex items-center space-x-1 font-medium transition-colors text-foreground hover:text-[rgb(var(--color-accent))]";

  const contentClasses = isMobile
    ? "mt-1 space-y-1"
    : "absolute top-full left-0 mt-2 w-56 card shadow-lg py-1 z-50";

  return (
    <div className={isMobile ? "" : "relative"} ref={dropdownRef}>
      <button onClick={toggle} className={buttonClasses}>
        {icon}
        <span>{label}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className={contentClasses}>
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`block ${
                isMobile
                  ? "py-2 px-4 text-sm text-foreground hover:bg-[rgb(var(--color-secondary-hover))] rounded"
                  : "px-4 py-2 text-sm text-foreground hover:bg-[rgb(var(--color-secondary-hover))]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
