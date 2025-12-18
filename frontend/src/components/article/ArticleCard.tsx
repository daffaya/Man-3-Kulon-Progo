/**
 * @fileoverview ArticleCard component for displaying article information.
 * This component renders article cards in two styles: featured and regular.
 * It displays article metadata including title, overview, cover image, tags, author, and publication details.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Article } from "../../types/articleTypes";
import { Clock, Calendar } from "lucide-react";
import { formatDate } from "../../lib/utils";
import ImageWithFallback from "../ui/ImageWithFallback";

/**
 * Props for the ArticleCard component
 */
interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

/**
 * Component to render a single article card.
 * Supports both featured and regular display styles.
 *
 * @param {Article} article - The article data to display.
 * @param {boolean} [featured=false] - Whether the article is featured.
 */
const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  featured = false,
}) => {
  const {
    title,
    slug,
    overview,
    coverImage,
    tags,
    publishedDate,
    readingTime,
    author,
  } = article;

  if (featured) {
    return (
      <article className="relative overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col w-full">
        {/* Image container with responsive aspect ratio */}
        <div className="aspect-[3/4] sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden w-full">
          <ImageWithFallback
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            fallback="/placeholder-image.jpg"
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          {/* Content container with responsive padding */}
          <div className="absolute inset-x-0 bottom-0 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-10 text-white">
            {/* Tags section */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
              {(tags || []).slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 text-xs font-medium bg-accent/80 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title with responsive font size */}
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-bold mb-2 sm:mb-3 leading-tight">
              <Link to={`/berita/${slug}`} className="hover:underline">
                {title}
              </Link>
            </h2>

            {/* Overview with responsive line clamping */}
            <p className="text-gray-200 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">
              <Link to={`/berita/${slug}`}>{overview}</Link>
            </p>

            {/* Author and metadata section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm mt-auto">
              <Link
                to={`/Profile`}
                className="flex items-center gap-2 max-w-full"
              >
                <ImageWithFallback
                  src={author.avatar}
                  alt={author.name}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                  fallback="/logo.png"
                />
                <span className="truncate font-medium">{author.name}</span>
              </Link>
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="sm:size-4" />
                  <span>{formatDate(publishedDate)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="sm:size-4" />
                  {readingTime} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white dark:bg-semibackground rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col">
      <Link
        to={`/berita/${slug}`}
        className="block overflow-hidden aspect-[16/9]"
      >
        <ImageWithFallback
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 rounded-xl shadow-lg"
          fallback="/placeholder-image.jpg"
        />
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-serif font-bold md:row-span-2 flex justify-items-center items-center mb-2">
          <Link
            to={`/berita/${slug}`}
            className="hover:text-accent transition-colors"
          >
            {title}
          </Link>
        </h3>

        <p className="fade-text text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">
          {overview}
        </p>

        <div className="flex items-center gap-2 md:col-start-2 md:row-start-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {readingTime} min read
          </span>
        </div>

        <div className="flex flex-wrap gap-2 my-4">
          {(tags || []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 grid-rows-2 text-sm mt-auto">
          <div className="flex items-center">
            <span className="font-bold text-xs">Ditulis oleh</span>
          </div>

          <div className="flex items-center justify-end">
            <span className="font-bold text-xs">Diterbitkan</span>
          </div>

          <div className="flex items-center">
            <span className="text-gray-700 dark:text-gray-300">
              {author.name}
            </span>
          </div>

          <div className="flex items-center text-gray-500 dark:text-gray-400 justify-end">
            <span className="flex items-center gap-1">
              {formatDate(publishedDate)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
