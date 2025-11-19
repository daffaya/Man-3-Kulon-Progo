/**
 * @fileoverview QuickActionCard component for displaying clickable action cards.
 * This component renders a styled card with an icon, title, and description that
 * can either navigate to a route or execute a custom function when clicked.
 * It supports different color themes and includes hover effects for better user interaction.
 */

import React from "react";
import { useNavigate } from "react-router-dom";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  to?: string;
  color?: "blue" | "green" | "purple";
}

/**
 * Component that displays a clickable action card with icon, title and description.
 * The card can either navigate to a specified route or execute a custom onClick function.
 * Features customizable color themes and hover effects for enhanced user experience.
 * @param {string} title - The title text displayed on the card
 * @param {string} description - The description text displayed below the title
 * @param {React.ReactNode} icon - The icon element to display
 * @param {Function} onClick - Optional callback function to execute when card is clicked
 * @param {string} to - Optional route path to navigate to when card is clicked
 * @param {string} color - Color theme for the card (blue, green, or purple)
 */
const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  onClick,
  to,
  color = "blue",
}) => {
  const navigate = useNavigate();

  /**
   * Handles card click events by either navigating to a route or calling onClick callback
   */
  const handleClick = () => {
    if (to) {
      navigate(to);
    } else if (onClick) {
      onClick();
    }
  };

  /**
   * Returns the appropriate CSS classes based on the selected color theme
   * @returns {string} CSS classes for styling the card based on color
   */
  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20";
      case "green":
        return "border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20";
      case "purple":
        return "border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20";
      default:
        return "border-l-4 border-gray-300 bg-gray-50 dark:bg-gray-800";
    }
  };

  return (
    <div
      className={`
        rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300
        hover:shadow-lg hover:-translate-y-1
        ${getColorClasses()}
      `}
      onClick={handleClick}
    >
      <div className="flex items-center mb-4">
        <div
          className={`
          flex items-center justify-center w-12 h-12 rounded-lg
          ${color === "blue" ? "bg-blue-100 text-blue-600" : ""}
          ${color === "green" ? "bg-green-100 text-green-600" : ""}
          ${color === "purple" ? "bg-purple-100 text-purple-600" : ""}
        `}
        >
          {icon}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  );
};

export default QuickActionCard;
