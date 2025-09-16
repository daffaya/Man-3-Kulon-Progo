import React from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, Eye, ArrowUp, RefreshCw } from "lucide-react";

import { Article } from "../../types";
import { formatDate, truncateText } from "../../lib/utils";

interface ArticleTableProps {
  articles: Article[];
  onDelete: (id: string) => void;
  loading: boolean;
}

// Extracted status badge component for better readability
const StatusBadge: React.FC<{ article: Article }> = ({ article }) => (
  <div className="flex items-center">
    {article.published ? (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
        Published
      </span>
    ) : (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
        Draft
      </span>
    )}
    {article.featured && (
      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 items-center">
        <ArrowUp size={12} className="mr-1" />
        Featured
      </span>
    )}
  </div>
);

// Extracted action buttons component
const ActionButtons: React.FC<{
  article: Article;
  onDelete: (id: string) => void;
}> = ({ article, onDelete }) => (
  <div className="flex justify-end space-x-2">
    <Link
      to={`/blog/${article.slug}`}
      className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      aria-label="View article"
    >
      <Eye size={18} />
    </Link>
    <Link
      to={`/atmin/edit/${article.slug}`}
      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      aria-label="Edit article"
    >
      <Edit size={18} />
    </Link>
    <button
      onClick={() => onDelete(article.id)}
      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
      aria-label="Delete article"
    >
      <Trash2 size={18} />
    </button>
  </div>
);

const ArticleTable: React.FC<ArticleTableProps> = ({
  articles,
  onDelete,
  loading,
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 relative min-h-[200px] flex items-center justify-center">
        <RefreshCw size={40} className="animate-spin text-accent" />
        <p className="mt-4 text-gray-600 dark:text-gray-400 absolute bottom-4">
          Loading articles...
        </p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">
          No articles found matching filters.
        </h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 relative">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tags
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {articles.map((article) => (
            <tr
              key={article.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-md object-cover"
                      src={article.coverImage}
                      alt={article.title}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium">
                      {truncateText(article.title, 40)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {article.readingTime} min read
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge article={article} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  {article.tags &&
                  Array.isArray(article.tags) &&
                  article.tags.length > 0
                    ? article.tags.join(", ")
                    : "-"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {article.category ? article.category.name : "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
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
