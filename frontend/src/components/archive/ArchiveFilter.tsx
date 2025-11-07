import React from "react";
import { Search } from "lucide-react";
import { Category } from "../../types/archiveTypes";

interface FiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  categories: Category[];
}

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
