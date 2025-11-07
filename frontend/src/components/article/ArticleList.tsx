// frontend/src/components/article/ArticleList.tsx
import React from "react";
import { Article } from "../../types/articleTypes";
import ArticleCard from "./ArticleCard";
import { RefreshCw } from "lucide-react";

interface ArticleListProps {
  articles: Article[];
  columns?: 1 | 2 | 3;
  loading: boolean;
}

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
