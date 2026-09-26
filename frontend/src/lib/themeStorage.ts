/**
 * @fileoverview Utility functions for theme-preference persistence using localStorage.
 * (Renamed from storage.ts — the file previously also held a full localStorage-backed
 * article CRUD implementation left over from before the real backend Article API
 * existed; that dead code has been removed. See AUDIT-025.)
 */

// localStorage keys
const THEME_STORAGE_KEY = "theme_preference";

/**
 * Retrieves the user's theme preference from localStorage.
 * Falls back to the system's color scheme preference if none is stored.
 * @returns {"light" | "dark"} The theme preference, either 'light' or 'dark'.
 */
export const getThemePreference = (): "light" | "dark" => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  // Check if user prefers dark mode
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
};

/**
 * Saves the user's theme preference to localStorage.
 * @param {"light" | "dark"} theme - The theme to save, either 'light' or 'dark'.
 */
export const saveThemePreference = (theme: "light" | "dark"): void => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};
