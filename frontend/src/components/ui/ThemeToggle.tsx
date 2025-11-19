/**
 * @fileoverview ThemeToggle component for switching between light and dark themes.
 * This component provides a button that toggles the application's theme and displays a sun or moon icon based on the current theme.
 */

import React, { useContext } from "react";
import { Moon, Sun } from "lucide-react";
import { ThemeContext } from "../../contexts/ThemeContext";

/**
 * Component that renders a button to toggle between light and dark themes.
 * It uses the ThemeContext to get the current theme and the toggle function.
 * The button's icon changes dynamically to reflect the active theme.
 */
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      {theme === "dark" ? (
        <Sun size={20} className="text-gray-200" />
      ) : (
        <Moon size={20} className="text-gray-700" />
      )}
    </button>
  );
};

export default ThemeToggle;
