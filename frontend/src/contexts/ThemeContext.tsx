/**
 * @fileoverview Theme context provider for managing application theme.
 * This context provides theme state (light/dark) and a function to toggle between themes.
 * It persists the theme preference in local storage and applies the theme to the document root.
 */

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { getThemePreference, saveThemePreference } from "../lib/storage";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

/**
 * Context for theme management that provides the current theme and toggle function.
 */
export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages theme state and provides it to child components.
 * Initializes theme from storage on mount and applies it to the document.
 * @param {ReactNode} children - Child components that will have access to the theme context.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light");

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = getThemePreference();
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  /**
   * Toggles between light and dark themes.
   * Updates state, saves preference to storage, and applies theme to document.
   */
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    saveThemePreference(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
