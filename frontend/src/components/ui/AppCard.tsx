/**
 * @fileoverview AppCard component for displaying application cards in a grid layout.
 * This component renders a card with an icon, title, and description, with hover effects
 * and optional click functionality. It can be disabled to prevent interaction.
 */

import React from "react";

interface AppCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Component that displays an application card with hover effects and optional click functionality.
 * The card includes an icon, title, and description, with a hover effect that highlights the card
 * and shows an accent color at the bottom. The card can be disabled to prevent interaction.
 * @param {string} title - The title of the application.
 * @param {string} description - A brief description of the application.
 * @param {React.ReactNode} icon - The icon element to display.
 * @param {Function} onClick - Optional callback function when the card is clicked.
 * @param {boolean} disabled - Whether the card should be disabled and non-interactive.
 */
const AppCard: React.FC<AppCardProps> = ({
  title,
  description,
  icon,
  onClick,
  disabled = false,
}) => {
  return (
    <div
      className={`
        group relative overflow-hidden card p-6
        transition-all duration-300 ease-in-out
        hover:-translate-y-1 hover:border-[rgb(var(--color-accent))]
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[rgb(var(--color-accent)),0.1] text-[rgb(var(--color-accent))] mb-4 group-hover:bg-[rgb(var(--color-accent)),0.2] transition-colors">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[rgb(var(--color-accent))] transition-colors">
        {title}
      </h3>

      <p className="text-secondary text-sm leading-relaxed">{description}</p>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[rgb(var(--color-accent))] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </div>
  );
};

export default AppCard;
