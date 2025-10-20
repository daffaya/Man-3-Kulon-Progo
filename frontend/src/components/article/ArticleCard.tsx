import React from "react";
import { Link } from "react-router-dom";
import { Article } from "../../types/articleTypes";
import { Clock, Calendar } from "lucide-react";
import { formatDate } from "../../lib/utils";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  featured = false,
}) => {
  const {
    title,
    slug,
    overview: overview,
    coverImage,
    tags,
    publishedDate,
    readingTime,
    author,
  } = article;

  if (featured) {
    return (
      <article className="relative overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col">
        <div className="aspect-[16/9] overflow-hidden max-w-full max-h-100">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex flex-wrap gap-2 mb-3">
              {(article.tags || []).slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 text-xs font-medium bg-accent/80 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3">
              <Link to={`/blog/${slug}`} className="hover:underline">
                {title}
              </Link>
            </h2>
            <p className="text-gray-200 mb-4 line-clamp-2">
              {" "}
              <Link to={`/blog/${slug}`}>{overview}</Link>
            </p>
            {/* Author and Date */}
            <div className="flex items-center justify-between text-sm mt-auto">
              <Link to={`/Profile`}>
                <div className="flex items-center gap-2">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-8 h-8 rounded-full object-cover"
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
      {/* Cover */}
      <Link
        to={`/blog/${slug}`}
        className="block overflow-hidden aspect-[16/9] my-0" // Remove the my-4 margin
      >
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 rounded-xl shadow-lg"
        />
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-xl font-serif font-bold md:row-span-2 flex justify-items-center items-center mb-2">
          <Link
            to={`/blog/${slug}`}
            className="hover:text-accent transition-colors"
          >
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="fade-text text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">
          {overview}
        </p>

        {/* min read */}
        <div className="flex items-center gap-2 md:col-start-2 md:row-start-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {readingTime} min read
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 my-4">
          {(article.tags || []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Author and Date */}
        <div className="grid grid-cols-2 grid-rows-2 text-sm mt-auto">
          <div className=" flex items-center">
            <span className="font-bold text-xs">Created By</span>
          </div>

          <div className="flex items-center justify-end">
            <span className="font-bold text-xs">Published on</span>
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
