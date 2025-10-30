// frontend/src/components/forms/ArticleForm.tsx

import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Article, ArticleFormData } from "../../types/articleTypes";
import { useArticles } from "../../contexts/ArticleContext";
import { RefreshCw, X, Upload, Image } from "lucide-react";
import ImageWithFallback from "../ui/ImageWithFallback";

/** Props for the ArticleForm component. */
interface ArticleFormProps {
  /** The article data to pre-fill the form for editing. */
  article?: Article;
  /** Function to call when the form is submitted. */
  onSubmit: (formData: ArticleFormData, file?: File) => void;
  /** Whether the form is in a loading state. */
  isLoading?: boolean;
}

/** Default author information for new articles. */
const defaultAuthor = {
  name: "Penulis Pena",
  avatar: "/profile.jpg",
};

/**
 * A form component for creating and editing articles.
 * It handles all article fields, including a rich text editor, image upload, tags, and categories.
 */
const ArticleForm: React.FC<ArticleFormProps> = ({
  article,
  onSubmit,
  isLoading = false,
}) => {
  const { state, fetchAdminCategories } = useArticles();

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    content: "",
    overview: "",
    coverImage: "",
    tags: [],
    publishedDate: format(new Date(), "yyyy-MM-dd"),
    featured: false,
    published: false,
    author: defaultAuthor,
    category_id: null,
  });

  const [tagInput, setTagInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        featured: article.featured ?? false,
        published: article.published ?? false,
        author: article.author || defaultAuthor,
        category_id: article.category_id ?? null,
      });

      if (article.coverImage) {
        setPreviewUrl(article.coverImage);
      }
    } else {
      setFormData({
        title: "",
        content: "",
        overview: "",
        coverImage: "",
        tags: [],
        publishedDate: format(new Date(), "yyyy-MM-dd"),
        featured: false,
        published: false,
        author: defaultAuthor,
        category_id: null,
      });
      setPreviewUrl("");
    }

    fetchAdminCategories();
  }, [article, fetchAdminCategories]);

  /**
   * Handles input changes for standard form fields, checkboxes, and selects.
   * @param e - The change event from the input element.
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
   * @param content - The new HTML content from the editor.
   */
  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  /**
   * Handles adding a new tag when the Enter key is pressed in the tag input field.
   * @param e - The keyboard event from the input element.
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
   * @param tagToRemove - The tag string to remove.
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  /**
   * Handles file selection for the cover image, creating a temporary preview URL.
   * @param e - The change event from the file input element.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  /** Resets the selected file and preview URL. */
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFormData((prev) => ({ ...prev, coverImage: "" }));
  };

  /** Programmatically clicks the hidden file input. */
  const handleUploadClick = () => fileInputRef.current?.click();

  /**
   * Handles the form submission event.
   * @param e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) onSubmit(formData, selectedFile);
    else onSubmit(formData);
  };

  if (state.adminCategoriesLoading && state.adminCategories.length === 0) {
    return (
      <div className="text-center p-6">
        <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
        <p className="mt-4">Memuat kategori...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Judul <span className="text-error">*</span>
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
        <label htmlFor="overview" className="block text-sm font-medium mb-1">
          Ringkasan <span className="text-error">*</span>
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
        <p className="text-xs text-gray-500 mt-1">
          Ringkasan singkat artikel (ditampilkan pada bagian preview)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Cover Image <span className="text-error">*</span>
        </label>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          disabled={isLoading}
        />

        <div className="flex items-center space-x-3 mb-3">
          <button
            type="button"
            onClick={handleUploadClick}
            className="btn btn-secondary flex items-center"
            disabled={isLoading}
          >
            <Upload size={16} className="mr-2" />
            Upload Gambar
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemoveFile}
              className="btn btn-outline flex items-center"
              disabled={isLoading}
            >
              <X size={16} className="mr-2" />
              Hapus Gambar
            </button>
          )}
        </div>

        {previewUrl ? (
          <div className="mt-2 aspect-[16/9] max-h-48 rounded-md overflow-hidden border">
            <ImageWithFallback
              src={previewUrl}
              alt="Pratinjau sampul"
              className="w-full h-full object-cover"
              fallback="/placeholder-image.jpg"
            />
          </div>
        ) : (
          <div className="mt-2 aspect-[16/9] max-h-48 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
            <Image size={32} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Belum ada gambar cover
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Klik "Upload Gambar" untuk menambahkan
            </p>
          </div>
        )}
        <input type="hidden" name="coverImage" value={formData.coverImage} />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          Konten <span className="text-error">*</span>
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
        <label htmlFor="tags" className="block text-sm font-medium mb-1">
          Tag
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                disabled={isLoading}
              >
                <X size={14} />
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
        <label htmlFor="category_id" className="block text-sm font-medium mb-1">
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
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <RefreshCw size={14} className="animate-spin mr-1" /> Memuat
            kategori...
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="publishedDate"
          className="block text-sm font-medium mb-1"
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
          <span className="ml-2 text-sm">Terbitkan</span>
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
          <span className="ml-2 text-sm">Sematkan</span>
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
