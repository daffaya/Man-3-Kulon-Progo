/**
 * @fileoverview React component for displaying articles in a table format.
 * This component provides a table view of articles with status badges, tags, categories,
 * and action buttons for viewing, editing, and deleting articles. It includes loading and empty states.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, Eye, ArrowUp, RefreshCw } from "lucide-react";
import { Article } from "../../types/articleTypes";
import { formatDate, truncateText } from "../../lib/utils";
import ImageWithFallback from "../ui/ImageWithFallback";

/**
 * Props for the ArticleTable component
 * @interface ArticleTableProps
 */
interface ArticleTableProps {
  articles: Article[];
  onDelete: (id: string) => void;
  loading: boolean;
}

/**
 * Props for the StatusBadge component
 * @interface StatusBadgeProps
 */
interface StatusBadgeProps {
  article: Article;
}

/**
 * Props for the ActionButtons component
 * @interface ActionButtonsProps
 */
interface ActionButtonsProps {
  article: Article;
  onDelete: (id: string) => void;
}

/**
 * Badge component to display publication status and featured status of an article.
 * Shows "Published" or "Draft" status and a "Featured" badge if applicable.
 *
 * @param {StatusBadgeProps} props - The component props
 * @returns {JSX.Element} The rendered status badges
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ article }) => (
  <div className="flex items-center">
    {article.published ? (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[rgb(var(--color-success),0.1)] text-[rgb(var(--color-success))] text-success">
        Published
      </span>
    ) : (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-900 text-secondary">
        Draft
      </span>
    )}
    {article.featured && (
      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-primary items-center">
        <ArrowUp size={12} className="mr-1" />
        Featured
      </span>
    )}
  </div>
);

/**
 * Action buttons component for each article row.
 * Provides buttons to view, edit, and delete an article.
 *
 * @param {ActionButtonsProps} props - The component props
 * @returns {JSX.Element} The rendered action buttons
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({ article, onDelete }) => {
  if (!article.id) {
    return (
      <div className="flex justify-end space-x-2">
        <span className="text-error text-xs">ID Missing</span>
      </div>
    );
  }

  return (
    <div className="flex justify-end space-x-2">
      <Link
        to={`/berita/${article.slug}`}
        className="text-secondary hover:text-foreground transition-colors"
        aria-label="View article"
        title="View article"
      >
        <Eye size={18} />
      </Link>

      <Link
        to={`/atmin/articles/${article.id}/edit`}
        className="text-accent hover:text-hover transition-colors"
        aria-label="Edit article"
        title="Edit article"
      >
        <Edit size={18} />
      </Link>

      <button
        onClick={() => onDelete(article.id)}
        className="text-error hover:text-error/80 transition-colors"
        aria-label="Delete article"
        title="Delete article"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

/**
 * Table component for displaying a list of articles in the admin interface.
 * Shows article details including title, status, tags, category, date, and action buttons.
 * Handles loading and empty states.
 *
 * @param {ArticleTableProps} props - The component props
 * @returns {JSX.Element} The rendered article table
 */
const ArticleTable: React.FC<ArticleTableProps> = ({
  articles,
  onDelete,
  loading,
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-zinc-800 relative min-h-[200px] flex items-center justify-center">
        <RefreshCw size={40} className="animate-spin text-accent" />
        <p className="mt-4 text-secondary absolute bottom-4">
          Loading articles...
        </p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-secondary">
          No articles found matching filters.
        </h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800 relative">
      <table className="min-w-full divide-y divide-zinc-800">
        <thead className="bg-semibackground">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider w-1/4">
              Title
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider w-1/6 hidden sm:table-cell">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider w-1/5 hidden md:table-cell">
              Tags
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider w-1/6 hidden lg:table-cell">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider w-1/6 hidden sm:table-cell">
              Date
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider w-1/12">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {articles.map((article) => (
            <tr
              key={article.id}
              className="hover:bg-semibackground transition-colors"
            >
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <ImageWithFallback
                      src={article.coverImage}
                      alt={article.title}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-foreground truncate max-w-xs">
                      {truncateText(article.title, 30)}
                    </div>
                    <div className="text-xs text-secondary sm:hidden">
                      <StatusBadge article={article} />
                    </div>
                    <div className="text-xs text-secondary sm:hidden">
                      {formatDate(article.publishedDate)}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                <StatusBadge article={article} />
              </td>

              <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {Array.isArray(article.tags) && article.tags.length > 0 ? (
                    article.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-full"
                      >
                        {truncateText(tag, 8)}
                      </span>
                    ))
                  ) : (
                    <span className="text-secondary text-sm">No tags</span>
                  )}
                  {article.tags.length > 2 && (
                    <span className="text-xs text-secondary">
                      +{article.tags.length - 2}
                    </span>
                  )}
                </div>
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm text-secondary hidden lg:table-cell">
                {truncateText(
                  article.category ? article.category.name : "-",
                  12
                )}
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm text-secondary hidden sm:table-cell">
                {formatDate(article.publishedDate)}
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <ActionButtons article={article} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ArticleTable;
