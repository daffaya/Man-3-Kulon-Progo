import { Article } from "../types/articleTypes";

// Sample articles data for initial state
const SAMPLE_ARTICLES: Article[] = [];

// localStorage keys
const ARTICLES_STORAGE_KEY = "berita_articles";
const THEME_STORAGE_KEY = "theme_preference";

// Get articles from localStorage or use sample data
export const getArticles = (): Article[] => {
  const storedArticles = localStorage.getItem(ARTICLES_STORAGE_KEY);
  if (storedArticles) {
    return JSON.parse(storedArticles);
  }

  // Initialize with sample articles if no stored data
  localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(SAMPLE_ARTICLES));
  return SAMPLE_ARTICLES;
};

// Get a single article by slug
export const getPublicArticleBySlug = (slug: string): Article | undefined => {
  const articles = getArticles();
  return articles.find((article) => article.slug === slug);
};

// Get a single article by ID
export const getAdminArticleById = (id: string): Article | undefined => {
  const articles = getArticles();
  return articles.find((article) => article.id === id);
};

// Save an article (create or update)
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

// Delete an article
export const deleteArticle = (id: string): void => {
  const articles = getArticles();
  const filteredArticles = articles.filter((article) => article.id !== id);
  localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(filteredArticles));
};

// Get theme preference
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

// Save theme preference
export const saveThemePreference = (theme: "light" | "dark"): void => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};
