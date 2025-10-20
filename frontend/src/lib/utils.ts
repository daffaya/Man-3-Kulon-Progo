import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { Article, ArticleFormData } from "../types/articleTypes";

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 225;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

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
  };
};

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

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const getTagColor = (tag: string): string => {
  // Simple hash function to generate consistent colors for tags
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
};
