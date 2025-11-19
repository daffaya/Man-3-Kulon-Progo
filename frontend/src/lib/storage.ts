/**
 * @fileoverview Utility functions for client-side data persistence using localStorage.
 * This module provides functions to manage articles and theme preferences stored in the browser's localStorage.
 * It handles initialization, retrieval, creation, updates, and deletion of articles, as well as getting and setting the UI theme.
 */

import { Article } from "../types/articleTypes";

// Sample articles data for initial state
const SAMPLE_ARTICLES: Article[] = [];

// localStorage keys
const ARTICLES_STORAGE_KEY = "berita_articles";
const THEME_STORAGE_KEY = "theme_preference";

/**
 * Retrieves articles from localStorage.
 * If no articles are stored, it initializes the storage with sample data and returns it.
 * @returns {Article[]} An array of articles.
 */
export const getArticles = (): Article[] => {
  const storedArticles = localStorage.getItem(ARTICLES_STORAGE_KEY);
  if (storedArticles) {
    return JSON.parse(storedArticles);
  }

  // Initialize with sample articles if no stored data
  localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(SAMPLE_ARTICLES));
  return SAMPLE_ARTICLES;
};

/**
 * Retrieves a single article from localStorage by its slug.
 * @param {string} slug - The slug of the article to find.
 * @returns {Article | undefined} The found article or undefined if not found.
 */
export const getPublicArticleBySlug = (slug: string): Article | undefined => {
  const articles = getArticles();
  return articles.find((article) => article.slug === slug);
};

/**
 * Retrieves a single article from localStorage by its ID.
 * @param {string} id - The ID of the article to find.
 * @returns {Article | undefined} The found article or undefined if not found.
 */
export const getAdminArticleById = (id: string): Article | undefined => {
  const articles = getArticles();
  return articles.find((article) => article.id === id);
};

/**
 * Saves an article to localStorage, creating a new one or updating an existing one.
 * @param {Article} article - The article object to save.
 */
export const saveArticle = (article: Article): void => {
  const articles = getArticles();
  const index = articles.findIndex((a) => a.id === article.id);

  if (index >= 0) {
    // Update existing article
    articles[index] = article;
  } else {
    // Add new article
    articles.push(article);
  }

  localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
};

/**
 * Deletes an article from localStorage by its ID.
 * @param {string} id - The ID of the article to delete.
 */
export const deleteArticle = (id: string): void => {
  const articles = getArticles();
  const filteredArticles = articles.filter((article) => article.id !== id);
  localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(filteredArticles));
};

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
