/**
 * @fileoverview React component for displaying a list of articles.
 * This component handles loading and empty states and renders the articles
 * in a responsive grid layout. The number of columns can be configured.
 */

import React from "react";
import { Article } from "../../types/articleTypes";
import ArticleCard from "./ArticleCard";
import { RefreshCw } from "lucide-react";

/**
 * Props for the ArticleList component.
 * @interface ArticleListProps
 */
interface ArticleListProps {
  /** Array of article objects to display. */
  articles: Article[];
  /** Optional number of columns for the grid layout (1, 2, or 3). Defaults to 3. */
  columns?: 1 | 2 | 3;
  /** Indicates whether the articles are currently being loaded. */
  loading: boolean;
}

/**
 * A React component that renders a list of articles.
 * It displays a loading spinner while fetching, a message if the list is empty,
 * and a responsive grid of ArticleCard components otherwise.
 *
 * @param {ArticleListProps} props - The component props.
 * @returns {JSX.Element} The rendered list of articles or a loading/empty state.
 */
const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  columns = 3,
  loading,
}) => {
  if (loading) {
    return (
      <div className="card p-12 text-center">
        <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
        <p className="mt-4 text-secondary">Memuat artikel...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="card p-12 text-center">
        <h3 className="text-xl font-medium text-secondary">
          Tidak ada artikel yang ditemukan dengan filter yang dipilih.
        </h3>
      </div>
    );
  }

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  }[columns];

  return (
    <div className={`grid ${gridCols} gap-6 sm:gap-8 fade-in`}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default ArticleList;
