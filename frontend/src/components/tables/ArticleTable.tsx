import React from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, Eye, ArrowUp, RefreshCw } from "lucide-react";
import { Article } from "../../types/articleTypes";
import { formatDate, truncateText } from "../../lib/utils";
import ImageWithFallback from "../ui/ImageWithFallback";

interface ArticleTableProps {
  /** Daftar artikel yang akan ditampilkan dalam tabel */
  articles: Article[];
  /** Callback ketika artikel dihapus */
  onDelete: (id: string) => void;
  /** Status loading data */
  loading: boolean;
}

/**
 * Badge untuk menampilkan status publikasi dan status featured artikel.
 */
const StatusBadge: React.FC<{ article: Article }> = ({ article }) => (
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
 * Tombol aksi untuk setiap artikel (View, Edit, Delete).
 */
const ActionButtons: React.FC<{
  article: Article;
  onDelete: (id: string) => void;
}> = ({ article, onDelete }) => {
  // Tampilkan fallback bila ID artikel tidak valid
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
 * Tabel daftar artikel untuk halaman admin.
 * Menampilkan status publikasi, kategori, tag, serta aksi untuk mengedit atau menghapus artikel.
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
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Tags
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-right text-xs font-medium text-secondary uppercase tracking-wider">
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
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <ImageWithFallback
                      src={article.coverImage}
                      alt={article.title}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-foreground">
                      {truncateText(article.title, 40)}
                    </div>
                    <div className="text-sm text-secondary">
                      {article.readingTime} min read
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge article={article} />
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {Array.isArray(article.tags) && article.tags.length > 0 ? (
                    article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-full"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-secondary text-sm">No tags</span>
                  )}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                {article.category ? article.category.name : "-"}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                {formatDate(article.publishedDate)}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
