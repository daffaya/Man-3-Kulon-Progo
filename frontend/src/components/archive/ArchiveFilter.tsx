/**
 * @fileoverview React component for filtering archive items.
 * This component provides a user interface with a search input field and a category dropdown.
 * It allows users to filter a list of archives based on a search query and a selected category.
 */

import React from "react";
import { Search } from "lucide-react";
import { Category } from "../../types/archiveTypes";

/**
 * Props for the Filters component.
 * @typedef {object} FiltersProps
 * @property {string} searchQuery - The current value of the search input.
 * @property {(value: string) => void} setSearchQuery - Function to update the search query state.
 * @property {string} categoryId - The ID of the selected category for filtering.
 * @property {(value: string) => void} setCategoryId - Function to update the selected category ID state.
 * @property {Category[]} categories - An array of category objects to populate the dropdown filter.
 */

interface FiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  categories: Category[];
}

/**
 * A component that renders search and category filter controls for the archive page.
 *
 * @param {FiltersProps} props - The props for the component.
 * @returns {JSX.Element} The rendered filter controls.
 */
const Filters: React.FC<FiltersProps> = ({
  searchQuery,
  setSearchQuery,
  categoryId,
  setCategoryId,
  categories,
}) => (
  <div className="card p-6 mb-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="archive-search"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Cari Arsip
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
          <input
            type="text"
            id="archive-search"
            placeholder="Cari nama file, deskripsi..."
            className="form-input w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="archive-category"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Filter Berdasarkan Kategori
        </label>
        <select
          id="archive-category"
          className="form-input w-full"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export default Filters;
