/**
 * @fileoverview Utility functions for article processing and general formatting.
 * This module provides helper functions for creating and manipulating article data,
 * such as generating slugs, calculating reading time, and formatting dates.
 * It also includes general-purpose utilities like text truncation and color generation.
 */

import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { Article, ArticleFormData } from "../types/articleTypes";

/**
 * Generates a URL-friendly slug from a given title string.
 * @param {string} title - The title string to convert.
 * @returns {string} The generated slug.
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

/**
 * Calculates the estimated reading time for a given content.
 * @param {string} content - The text content to analyze.
 * @returns {number} The estimated reading time in minutes.
 */
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 225;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Creates a new article object from form data.
 * Automatically generates a unique ID, slug, reading time, and timestamps.
 * @param {ArticleFormData} articleData - The form data for the new article.
 * @returns {Article} The fully formed article object.
 */
export const createArticle = (articleData: ArticleFormData): Article => {
  const id = uuidv4();
  const slug = generateSlug(articleData.title);
  const now = new Date();
  const readingTime = calculateReadingTime(articleData.content);

  return {
    ...articleData,
    id,
    slug,
    readingTime,
    publishedDate: articleData.publishedDate || format(now, "yyyy-MM-dd"),
    lastModified: format(now, "yyyy-MM-dd"),
    category: null,
  };
};

/**
 * Updates an existing article object with new data.
 * Recalculates the slug and reading time if the title or content is updated.
 * Updates the lastModified timestamp.
 * @param {Article} article - The original article object.
 * @param {Partial<ArticleFormData>} updates - The partial data to update the article with.
 * @returns {Article} The updated article object.
 */
export const updateArticle = (
  article: Article,
  updates: Partial<ArticleFormData>
): Article => {
  const updated = {
    ...article,
    ...updates,
    lastModified: format(new Date(), "yyyy-MM-dd"),
  };

  if (updates.title) {
    updated.slug = generateSlug(updates.title);
  }

  if (updates.content) {
    updated.readingTime = calculateReadingTime(updates.content);
  }

  return updated;
};

/**
 * Formats a date string into a human-readable format.
 * Handles invalid or null date strings by returning a placeholder.
 * @param {string | null | undefined} dateString - The date string to format.
 * @returns {string} The formatted date string or "-" if the date is invalid.
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return "-";
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date value passed to formatDate:", dateString);
      return "-";
    }
    return format(date, "d MMMM yyyy");
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "-";
  }
};

/**
 * Truncates a string to a maximum length and adds an ellipsis.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - The maximum length of the string.
 * @returns {string} The truncated string.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Generates a consistent HSL color for a given tag string using a simple hash function.
 * @param {string} tag - The tag string to generate a color for.
 * @returns {string} An HSL color string.
 */
export const getTagColor = (tag: string): string => {
  // Simple hash function to generate consistent colors for tags
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
};
