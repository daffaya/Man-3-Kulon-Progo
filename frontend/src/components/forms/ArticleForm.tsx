/**
 * @fileoverview ArticleForm component for creating and editing articles.
 * This component provides a comprehensive form with fields for title, overview, rich text content,
 * cover image upload, tags, categories, and publication settings. It supports both creating
 * new articles and editing existing ones.
 */

import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Article, ArticleFormData } from "../../types/articleTypes";
import { useArticles } from "../../contexts/ArticleContext";
import { useAuth } from "../../contexts/AuthContext";
import { RefreshCw, X } from "lucide-react";
import ImageUploader from "../ui/ImageUploader";

/** Props for ArticleForm component. */
interface ArticleFormProps {
  /** The article data to pre-fill the form for editing. */
  article?: Article;
  /** Function to call when the form is submitted. */
  onSubmit: (formData: ArticleFormData, file?: File) => void;
  /** Whether the form is in a loading state. */
  isLoading?: boolean;
}

/**
 * A form component for creating and editing articles.
 * It handles all article fields, including a rich text editor, image upload, tags, and categories.
 *
 * @param {ArticleFormProps} props - The component props.
 * @returns {JSX.Element} The rendered ArticleForm component.
 */
const ArticleForm: React.FC<ArticleFormProps> = ({
  article,
  onSubmit,
  isLoading = false,
}) => {
  const { state, fetchAdminCategories } = useArticles();
  const { user } = useAuth();

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    content: "",
    overview: "",
    coverImage: "",
    tags: [],
    publishedDate: format(new Date(), "yyyy-MM-dd"),
    featured: true,
    published: true,
    author: {
      name: user?.full_name || user?.username || "Penulis Pena",
      avatar: user?.avatar || "/logo.png",
    },
    category_id: null,
  });

  const [tagInput, setTagInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  /** Configuration for the React Quill rich text editor toolbar. */
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  /**
   * Populates the form with article data if an article prop is provided (for editing).
   * Otherwise, it resets the form to its default state.
   * Also fetches the list of admin categories.
   */
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        content: article.content,
        overview: article.overview,
        coverImage: article.coverImage || "",
        tags: article.tags || [],
        publishedDate: article.publishedDate
          ? format(new Date(article.publishedDate), "yyyy-MM-dd")
          : "",
        featured: article.featured ?? true,
        published: article.published ?? true,
        author: article.author || {
          name: user?.full_name || user?.username || "Penulis Pena",
          avatar: user?.avatar || "/logo.png",
        },
        category_id: article.category_id ?? null,
      });
    } else {
      setFormData({
        title: "",
        content: "",
        overview: "",
        coverImage: "",
        tags: [],
        publishedDate: format(new Date(), "yyyy-MM-dd"),
        featured: true,
        published: true,
        author: {
          name: user?.full_name || user?.username || "Penulis Pena",
          avatar: user?.avatar || "/logo.png",
        },
        category_id: null,
      });
    }

    fetchAdminCategories();
  }, [article, fetchAdminCategories, user]);

  /**
   * Handles input changes for standard form fields, checkboxes, and selects.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The change event from the input element.
   */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === "category_id") {
      setFormData((prev) => ({
        ...prev,
        category_id: value === "" ? null : parseInt(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /**
   * Handles changes in the rich text editor content.
   * @param {string} content - The new HTML content from the editor.
   */
  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  /**
   * Handles adding a new tag when the Enter key is pressed in the tag input field.
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event from the input element.
   */
  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
        setTagInput("");
      }
    }
  };

  /**
   * Removes a tag from the form's tag list.
   * @param {string} tagToRemove - The tag string to remove.
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  /**
   * Handles image change from the ImageUploader component.
   * Updates the selected file and the cover image URL in the form data.
   * @param {File} [file] - The selected file (if any).
   * @param {string} [url] - The image URL (if any).
   */
  const handleImageChange = (file?: File, url?: string) => {
    if (file) {
      setSelectedFile(file);
      setFormData((prev) => ({ ...prev, coverImage: prev.coverImage }));
    } else if (url) {
      setSelectedFile(null);
      setFormData((prev) => ({ ...prev, coverImage: url }));
    } else {
      setSelectedFile(null);
      setFormData((prev) => ({ ...prev, coverImage: "" }));
    }
  };

  /**
   * Handles the form submission event.
   * Prepares the form data, including author information, and calls the onSubmit prop.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formDataWithAuthor = {
      ...formData,
      author: {
        name: user?.full_name || user?.username || "Penulis Pena",
        avatar: user?.avatar || "/logo.png",
      },
    };

    if (selectedFile) onSubmit(formDataWithAuthor, selectedFile);
    else onSubmit(formDataWithAuthor);
  };

  if (state.adminCategoriesLoading && state.adminCategories.length === 0) {
    return (
      <div className="card p-8 text-center">
        <RefreshCw
          size={32}
          className="mx-auto animate-spin text-[rgb(var(--color-accent))]"
        />
        <p className="mt-4 text-secondary">Memuat kategori...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Judul <span className="text-[rgb(var(--color-error))]">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="form-input"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label
          htmlFor="overview"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Ringkasan <span className="text-[rgb(var(--color-error))]">*</span>
        </label>
        <textarea
          id="overview"
          name="overview"
          value={formData.overview}
          onChange={handleInputChange}
          className="form-input"
          rows={2}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-secondary mt-1">
          Ringkasan singkat artikel (ditampilkan pada bagian preview)
        </p>
      </div>

      <div>
        <ImageUploader
          currentImage={formData.coverImage}
          onImageChange={handleImageChange}
          disabled={isLoading}
          label="Cover Image"
          required={true}
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Konten <span className="text-[rgb(var(--color-error))]">*</span>
        </label>
        <ReactQuill
          value={formData.content}
          onChange={handleContentChange}
          modules={quillModules}
          placeholder="Tulis konten artikel di sini..."
          className="quill-editor"
          theme="snow"
          readOnly={isLoading}
        />
      </div>

      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Tag
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgb(var(--color-secondary-button))] text-[rgb(var(--color-foreground))]"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1.5 hover:bg-[rgb(var(--color-foreground))] hover:text-[rgb(var(--color-background))] rounded-full p-0.5 transition-colors"
                disabled={isLoading}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagInputKeyPress}
          className="form-input"
          placeholder="Ketik tag dan tekan Enter"
          disabled={isLoading}
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="category_id"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Kategori
        </label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id === null ? "" : formData.category_id}
          onChange={handleInputChange}
          className="form-input"
          disabled={isLoading}
        >
          <option value="">-- Pilih Kategori (Opsional) --</option>
          {state.adminCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {state.adminCategoriesLoading && state.adminCategories.length === 0 && (
          <p className="mt-2 text-sm text-secondary flex items-center">
            <RefreshCw size={14} className="animate-spin mr-1" /> Memuat
            kategori...
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="publishedDate"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Tanggal Publikasi
        </label>
        <input
          type="date"
          id="publishedDate"
          name="publishedDate"
          value={formData.publishedDate || ""}
          onChange={handleInputChange}
          className="form-input"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:gap-6">
        <label className="flex items-center h-10">
          <input
            type="checkbox"
            id="published"
            name="published"
            checked={formData.published}
            onChange={handleInputChange}
            className="w-4 h-4 rounded"
            disabled={isLoading}
          />
          <span className="ml-2 text-sm text-foreground">Terbitkan</span>
        </label>

        <label className="flex items-center h-10">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleInputChange}
            className="w-4 h-4 rounded"
            disabled={isLoading}
          />
          <span className="ml-2 text-sm text-foreground">Sematkan</span>
        </label>
      </div>

      <div className="pt-4 flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw size={16} className="animate-spin mr-2" />
              {article ? "Memperbarui Artikel..." : "Membuat Artikel..."}
            </>
          ) : article ? (
            "Perbarui Artikel"
          ) : (
            "Buat Artikel"
          )}
        </button>
      </div>
    </form>
  );
};

export default ArticleForm;
