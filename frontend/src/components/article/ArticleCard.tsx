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
      <article className="relative overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col">
        <div className="aspect-[16/9] overflow-hidden max-w-full h-120">
          <ImageWithFallback
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            fallback="/placeholder-image.jpg"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 px-48 py-8 text-white">
            <div className="flex flex-wrap gap-2 mb-3">
              {(tags || []).slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 text-xs font-medium bg-accent/80 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3">
              <Link to={`/berita/${slug}`} className="hover:underline">
                {title}
              </Link>
            </h2>
            <p className="text-gray-200 mb-4 line-clamp-2">
              <Link to={`/berita/${slug}`}>{overview}</Link>
            </p>
            <div className="flex items-center justify-between text-sm mt-auto">
              <Link to={`/Profile`}>
                <div className="flex items-center gap-2">
                  <ImageWithFallback
                    src={author.avatar}
                    alt={author.name}
                    className="w-8 h-8 rounded-full object-cover"
                    fallback="/logo.png"
                  />
                  <span>{author.name}</span>
                </div>
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDate(publishedDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {readingTime} min read
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
