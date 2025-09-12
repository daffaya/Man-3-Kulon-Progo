import React from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, Eye, ArrowUp, RefreshCw } from "lucide-react";

import { Article } from "../../types";
import { formatDate, truncateText } from "../../lib/utils";

interface ArticleTableProps {
  articles: Article[];
  columns?: 1 | 2 | 3;
  onDelete: (id: string) => void;
  loading: boolean;
}

const ArticleTable: React.FC<ArticleTableProps> = ({
  articles,
  columns = 3,
  onDelete,
  loading,
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 relative min-h-[200px] flex items-center justify-center">
        {" "}
        {/* Tambahkan min-h agar loading terlihat */}
        <RefreshCw size={40} className="animate-spin text-accent" />{" "}
        {/* Ubah warna icon loading */}
        <p className="mt-4 text-gray-600 dark:text-gray-400 absolute bottom-4">
          Loading articles...
        </p>{" "}
      </div>
    );
  }

  if (!loading && articles.length === 0) {
    return (
      <div className="text-center py-12">
        {" "}
        <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">
          No articles found matching filters.{" "}
        </h3>{" "}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 relative">
      {/* Added relative for absolute loading overlay */}{" "}
      {/* Loading overlay inside the table container */}{" "}
      {/* Moved loading check here */}{" "}
      {/* Loading state sudah di-handle di awal komponen, hapus overlay ini */}{" "}
      {/* {loading && (
    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10 rounded-lg">
     <RefreshCw size={40} className="animate-spin text-white" />
    </div>
   )} */}{" "}
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        {" "}
        <thead className="bg-gray-50 dark:bg-gray-900">
          {" "}
          <tr>
            {" "}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Title{" "}
            </th>{" "}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status{" "}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tags{" "}
            </th>{" "}
            {/* PERUBAHAN: Tambahkan Header Kolom Kategori */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Category{" "}
            </th>{" "}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Date{" "}
            </th>{" "}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions{" "}
            </th>{" "}
          </tr>{" "}
        </thead>{" "}
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {" "}
          {articles.map((article) => {
            return (
              <tr
                key={article.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {" "}
                <td className="px-6 py-4 whitespace-nowrap">
                  {" "}
                  <div className="flex items-center">
                    {" "}
                    <div className="flex-shrink-0 h-10 w-10">
                      {" "}
                      <img
                        className="h-10 w-10 rounded-md object-cover"
                        src={article.coverImage}
                        alt={article.title}
                      />{" "}
                    </div>{" "}
                    <div className="ml-4">
                      {" "}
                      <div className="text-sm font-medium">
                        {" "}
                        {truncateText(article.title, 40)}{" "}
                      </div>{" "}
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {article.readingTime} min read{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                </td>{" "}
                <td className="px-6 py-4 whitespace-nowrap">
                  {" "}
                  <div className="flex items-center">
                    {" "}
                    {article.published ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        Published{" "}
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        Draft{" "}
                      </span>
                    )}{" "}
                    {article.featured && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 items-center">
                        {" "}
                        <ArrowUp size={12} className="mr-1" />
                        Featured{" "}
                      </span>
                    )}{" "}
                  </div>{" "}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {" "}
                  <div className="flex items-center">
                    {" "}
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      {" "}
                      {/* --- LOGIKA MENAMPILKAN TAGS --- */}{" "}
                      {article.tags &&
                      Array.isArray(article.tags) &&
                      article.tags.length > 0
                        ? article.tags.join(", ")
                        : "-"}{" "}
                      {/* Tampilkan '-' jika tidak ada tag */}
                      {/* --- AKHIR LOGIKA MENAMPILKAN TAGS --- */}{" "}
                    </span>{" "}
                  </div>{" "}
                </td>{" "}
                {/* PERUBAHAN: Tambahkan Kolom Data Kategori */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {/* Tampilkan nama kategori jika ada, jika tidak tampilkan '-' */}
                  {article.category ? article.category.name : "-"}
                </td>{" "}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(article.publishedDate)}{" "}
                </td>{" "}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {" "}
                  <div className="flex justify-end space-x-2">
                    {" "}
                    <Link
                      to={`/blog/${article.slug}`}
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      <Eye size={18} />{" "}
                    </Link>{" "}
                    <Link
                      to={`/atmin/edit/${article.slug}`}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Edit size={18} />{" "}
                    </Link>{" "}
                    <button
                      onClick={() => onDelete(article.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={18} />{" "}
                    </button>{" "}
                  </div>{" "}
                </td>{" "}
              </tr>
            );
          })}{" "}
        </tbody>{" "}
      </table>{" "}
      {/* Pesan "No articles found" di luar tabel jika array kosong setelah loading selesai */}{" "}
      {/* Kondisi ini sudah di-handle di AdminDashboard.tsx, hapus dari sini */}{" "}
      {/* {!loading && articles.length === 0 && (
    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
     No articles found. Get started by creating your first article.
    </div>
   )} */}{" "}
    </div>
  );
};

export default ArticleTable;
