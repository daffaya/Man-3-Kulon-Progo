/**
 * Represents a category for articles.
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Data structure for creating or updating a category.
 */
export interface CategoryFormData {
  name: string;
  description?: string | null;
}

// frontend/src/types/articleTypes.ts

/**
 * Represents an article.
 */
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  overview: string;
  coverImage: string;
  tags: string[];
  publishedDate: string | null;
  lastModified: string;
  featured: boolean;
  published: boolean;
  author: {
    name: string;
    avatar: string;
  };
  readingTime: number;
  category_id: number | null;
  category: Category | null;
}

/**
 * Data structure for creating or updating an article.
 * Excludes auto-generated or calculated fields from the Article interface.
 */
export type ArticleFormData = Omit<
  Article,
  "id" | "slug" | "readingTime" | "lastModified" | "category"
> & { category_id?: number | null };

/**
 * Pagination response data for articles.
 */
export interface PaginationData<T> {
  articles: T[];
  totalArticles: number;
  totalPages: number;
  currentPage: number;
  articlesPerPage: number;
}

/**
 * Filters for querying articles.
 */
export interface ArticleFilters {
  keyword?: string;
  published?: boolean;
  featured?: boolean;
  tag?: string | string[];
  category?: string;
  page?: number;
  limit?: number;
}
