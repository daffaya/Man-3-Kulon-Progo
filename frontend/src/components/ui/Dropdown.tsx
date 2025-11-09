// src/components/ui/Dropdown.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useDropdown } from "../../hooks/useDropdown";

export type DropdownItem = {
  to: string;
  label: string;
};

interface DropdownProps {
  label: string;
  icon: React.ReactNode;
  items: DropdownItem[];
  isMobile?: boolean;
}

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
