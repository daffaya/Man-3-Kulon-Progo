// frontend/src/components/article/ArticleContent.tsx
import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Article } from "../../types/articleTypes";
import { formatDate } from "../../lib/utils";
import { Clock, Calendar } from "lucide-react";
import ImageWithFallback from "../ui/ImageWithFallback";

interface ArticleContentProps {
  article: Article;
}

/**
 * Parse various possible `tags` formats into a clean string array.
 * Handles:
 * - string (CSV or JSON)
 * - array
 * - object or array-like object
 * - nested values
 */
const parseTags = (tags: unknown): string[] => {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0);
  }

  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed
          .map((tag) => String(tag).trim())
          .filter((tag) => tag.length > 0);
      }
    } catch {
      return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }
  }

  if (typeof tags === "object" && tags !== null) {
    const obj = tags as Record<string, unknown>;

    if (Array.isArray(obj.tags)) {
      return obj.tags
        .map((tag) => String(tag).trim())
        .filter((tag) => tag.length > 0);
    }

    if (
      Object.prototype.hasOwnProperty.call(obj, "length") &&
      Object.prototype.hasOwnProperty.call(obj, "0")
    ) {
      const length = (obj as any).length;
      const result: string[] = [];
      for (let i = 0; i < length; i++) {
        const value = (obj as any)[i];
        if (value != null) result.push(String(value).trim());
      }
      return result.filter((tag) => tag.length > 0);
    }

    const values = Object.values(obj);
    for (const value of values) {
      if (Array.isArray(value)) {
        return value
          .map((tag) => String(tag).trim())
          .filter((tag) => tag.length > 0);
      }
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed
              .map((tag) => String(tag).trim())
              .filter((tag) => tag.length > 0);
          }
        } catch {
          return value
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
        }
      }
    }

    try {
      const stringified = JSON.stringify(tags);
      const parsed = JSON.parse(stringified);
      if (Array.isArray(parsed)) {
        return parsed
          .map((tag) => String(tag).trim())
          .filter((tag) => tag.length > 0);
      }
    } catch (e) {
      console.error("Failed to parse tags object:", e);
    }
  }

  return [];
};

/**
 * Component for rendering a single article's content,
 * including author info, publish date, reading time, cover image,
 * sanitized HTML content, and parsed tags.
 */
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

  const [processedContent, setProcessedContent] = useState("");
  const [parsedTags, setParsedTags] = useState<string[]>([]);

  /**
   * Sanitize HTML and update tags when article content changes.
   */
  useEffect(() => {
    const parsed = parseTags(tags);
    setParsedTags(parsed);
  }, [tags]);

  /**
   * Process image URLs inside HTML content so relative paths
   * are converted to full URLs for rendering.
   */
  const processImageUrls = (htmlContent: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const images = doc.querySelectorAll("img");

    images.forEach((img) => {
      const src = img.getAttribute("src");
      if (src && src.startsWith("/")) {
        img.setAttribute(
          "src",
          `${
            import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001"
          }${src}`
        );
      }
    });

    return doc.body.innerHTML;
  };

  useEffect(() => {
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
      ADD_ATTR: ["href", "src", "alt"],
    });

    const processed = processImageUrls(sanitizedContent);
    setProcessedContent(processed);
  }, [content]);

  return (
    <article className="fade-in">
      <div className="mb-8">
        <h1 className="text-4xl sm:text-4xl font-serif font-bold mb-6">
          {title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-y-4 mb-8">
          <div className="flex items-center gap-3">
            <ImageWithFallback
              src={author.avatar}
              alt={author.name}
              className="w-10 h-10 rounded-full object-cover"
              fallback="/logo.png"
            />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Ditulis oleh
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
          <ImageWithFallback
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
            fallback="/placeholder-image.jpg"
          />
        </div>
      </div>

      {/* Render sanitized and processed HTML from Quill */}
      <div
        className="ql-editor article-content [text-align:justify] text-muted font-medium"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-medium mb-3 font-sans">Tags:</h3>
        <div className="flex flex-wrap gap-2">
          {parsedTags.length > 0 ? (
            parsedTags.map((tag, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No tags available
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default ArticleContent;
