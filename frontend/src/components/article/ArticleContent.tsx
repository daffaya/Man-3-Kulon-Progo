import React from "react";
import DOMPurify from "dompurify"; // Import untuk sanitasi
import { Article } from "../../types/articleTypes";
import { formatDate } from "../../lib/utils";
import { Clock, Calendar } from "lucide-react";

interface ArticleContentProps {
  article: Article;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ article }) => {
  const {
    title,
    content,
    coverImage,
    tags,
    publishedDate,
    readingTime,
    author,
  } = article;

  // Sanitasi HTML dari Quill untuk cegah XSS
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "p",
      "b",
      "i",
      "u",
      "strong",
      "em",
      "h1",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "blockquote",
      "br",
    ],
    ADD_ATTR: ["href", "src", "alt"], // Ganti ALLOWED_ATTR dengan ADD_ATTR
  });

  return (
    <article className="fade-in">
      <div className="mb-8">
        <h1 className="text-4xl sm:text-4xl font-serif font-bold mb-6">
          {title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-y-4 mb-8">
          <div className="flex items-center gap-3">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Created by
              </div>
              <div className="font-medium">{author.name}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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

        <div className="aspect-[16/9] rounded-xl overflow-hidden mb-8">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Render HTML dari Quill dengan sanitasi */}
      <div
        className="ql-editor article-content md:text-left text-muted font-medium"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-medium mb-3 font-sans">Tags:</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default ArticleContent;
