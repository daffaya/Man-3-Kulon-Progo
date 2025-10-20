export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string | null;
}

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

export type ArticleFormData = Omit<
  Article,
  "id" | "slug" | "readingTime" | "lastModified" | "category"
> & { category_id?: number | null };

export interface PaginationData<T> {
  articles: T[];
  totalArticles: number;
  totalPages: number;
  currentPage: number;
  articlesPerPage: number;
}

export interface ArticleFilters {
  keyword?: string;
  published?: boolean;
  featured?: boolean;
  tag?: string | string[];
  category?: string;
  page?: number;
  limit?: number;
}
