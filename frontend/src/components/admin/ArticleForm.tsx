import React, { useState, useEffect } from "react";
import { format } from "date-fns";

import { Article, ArticleFormData, Category } from "../../types/articleTypes";
import { useArticles } from "../../contexts/ArticleContext";
import { RefreshCw, X } from "lucide-react";

interface ArticleFormProps {
  article?: Article;
  onSubmit: (formData: ArticleFormData) => void;
}

const defaultAuthor = {
  name: "Penulis Pena",
  avatar: "/profile.jpg",
};

const ArticleForm: React.FC<ArticleFormProps> = ({ article, onSubmit }) => {
  const { adminCategories, adminCategoriesLoading, fetchAdminCategories } =
    useArticles();

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

  useEffect(() => {
    console.log(
      "[ArticleForm useEffect] Initializing form and fetching categories..."
    );

    if (article) {
      console.log(
        "[ArticleForm useEffect] Initializing form with article data:",
        article
      );
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
      console.log("[ArticleForm useEffect] Form data state initialized.");
    } else {
      console.log(
        "[ArticleForm useEffect] Initializing form with default data."
      );
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
      console.log("[ArticleForm useEffect] Form data state reset to default.");
    }

    console.log(
      "[ArticleForm useEffect] Fetching admin categories for form..."
    );
    fetchAdminCategories();
  }, [article, fetchAdminCategories]);

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
      const categoryId = value === "" ? null : parseInt(value);
      console.log(
        `[ArticleForm] Category select changed. Value: ${value}, Parsed ID: ${categoryId}`
      );
      setFormData((prev) => ({
        ...prev,
        category_id: categoryId,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

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

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[ArticleForm] Submitting form with data:", formData);
    onSubmit(formData);
  };

  if (adminCategoriesLoading && adminCategories.length === 0) {
    return (
      <div className="text-center p-6">
        <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
        <p className="mt-4">Loading categories...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {" "}
      <div>
        {" "}
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title <span className="text-error">*</span>{" "}
        </label>{" "}
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="form-input"
          required
        />{" "}
      </div>{" "}
      <div>
        {" "}
        <label htmlFor="overview" className="block text-sm font-medium mb-1">
          Overview <span className="text-error">*</span>{" "}
        </label>{" "}
        <textarea
          id="overview"
          name="overview"
          value={formData.overview}
          onChange={handleInputChange}
          className="form-input"
          rows={2}
          required
        />{" "}
        <p className="text-xs text-gray-500 mt-1">
          A brief summary of your article (displayed in article previews){" "}
        </p>{" "}
      </div>{" "}
      <div>
        {" "}
        <label htmlFor="coverImage" className="block text-sm font-medium mb-1">
          Cover Image URL <span className="text-error">*</span>{" "}
        </label>{" "}
        <input
          type="url"
          id="coverImage"
          name="coverImage"
          value={formData.coverImage}
          onChange={handleInputChange}
          className="form-input"
          required
        />{" "}
        {formData.coverImage && (
          <div className="mt-2 aspect-[16/9] max-h-48 rounded-md overflow-hidden">
            {" "}
            <img
              src={formData.coverImage}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />{" "}
          </div>
        )}{" "}
      </div>{" "}
      <div>
        {" "}
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          Content (Markdown) <span className="text-error">*</span>{" "}
        </label>{" "}
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          className="form-textarea"
          rows={12}
          required
        />{" "}
        <p className="text-xs text-gray-500 mt-1">
          Use Markdown for formatting. Headers, lists, links, and more are
          supported.{" "}
        </p>{" "}
      </div>{" "}
      <div>
        {" "}
        <label htmlFor="tags" className="block text-sm font-medium mb-1">
          Tags{" "}
        </label>{" "}
        <div className="mb-2 flex flex-wrap gap-2">
          {" "}
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800"
            >
              {tag}{" "}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                &times;{" "}
              </button>{" "}
            </span>
          ))}{" "}
        </div>{" "}
        <input
          type="text"
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagInputKeyPress}
          className="form-input"
          placeholder="Type a tag and press Enter"
        />{" "}
      </div>
      {/* PERUBAHAN: Category Selection */}
      <div className="mb-4">
        <label htmlFor="category_id" className="block text-sm font-medium mb-1">
          Category
        </label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id === null ? "" : formData.category_id}
          onChange={handleInputChange}
          className="form-input"
        >
          <option value="">-- Select Category (Optional) --</option>{" "}
          {/* Opsi untuk NULL */}
          {/* Tampilkan daftar kategori dari context */}
          {adminCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {/* Indikator loading untuk kategori (jika belum dimuat) */}
        {adminCategoriesLoading && adminCategories.length === 0 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <RefreshCw size={14} className="animate-spin mr-1" /> Loading
            categories...
          </p>
        )}
      </div>{" "}
      <div>
        {" "}
        <label
          htmlFor="publishedDate"
          className="block text-sm font-medium mb-1"
        >
          Publication Date{" "}
        </label>{" "}
        <input
          type="date"
          id="publishedDate"
          name="publishedDate"
          value={formData.publishedDate || ""}
          onChange={handleInputChange}
          className="form-input"
        />{" "}
      </div>{" "}
      <div className="flex flex-col sm:flex-row sm:gap-6">
        {" "}
        <div className="flex items-center h-10">
          {" "}
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleInputChange}
            className="w-4 h-4 rounded"
          />{" "}
          <label htmlFor="featured" className="ml-2 text-sm">
            Featured article{" "}
          </label>{" "}
        </div>{" "}
        <div className="flex items-center h-10">
          {" "}
          <input
            type="checkbox"
            id="published"
            name="published"
            checked={formData.published}
            onChange={handleInputChange}
            className="w-4 h-4 rounded"
          />{" "}
          <label htmlFor="published" className="ml-2 text-sm">
            Published{" "}
          </label>{" "}
        </div>{" "}
      </div>{" "}
      <div className="pt-4 flex justify-end">
        {" "}
        <button type="submit" className="btn btn-primary">
          {article ? "Update Article" : "Create Article"}{" "}
        </button>{" "}
      </div>{" "}
    </form>
  );
};

export default ArticleForm;
