/**
 * @fileoverview Alumni filter component for searching and filtering alumni data.
 * This component provides input fields for searching alumni by name and filtering by graduation year and status.
 */

import React from "react";
import { Search } from "lucide-react";

/**
 * Props for the AlumniFilter component
 */
interface AlumniFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  graduationYear: string;
  setGraduationYear: (year: string) => void;
  status: string;
  setStatus: (status: string) => void;
  years: string[];
  statusOptions: string[];
  onFilterChange?: () => void;
}

/**
 * AlumniFilter component that provides UI elements for filtering alumni data.
 * Allows users to search by name and filter by graduation year and status.
 *
 * @param {AlumniFilterProps} props - The component props
 * @returns {JSX.Element} The rendered filter component
 */
const AlumniFilter: React.FC<AlumniFilterProps> = ({
  searchQuery,
  setSearchQuery,
  graduationYear,
  setGraduationYear,
  status,
  setStatus,
  years,
  statusOptions,
  onFilterChange,
}) => {
  /**
   * Handler for search input changes
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onFilterChange) onFilterChange();
  };

  /**
   * Handler for year selection changes
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The select change event
   */
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGraduationYear(e.target.value);
    if (onFilterChange) onFilterChange();
  };

  /**
   * Handler for status selection changes
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The select change event
   */
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    if (onFilterChange) onFilterChange();
  };

  return (
    <div className="card p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="searchInput"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Cari Alumni
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary h-5 w-5" />
            <input
              id="searchInput"
              type="text"
              placeholder="Cari berdasarkan nama..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 form-input w-full"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="yearSelect"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Tahun Lulus
          </label>
          <select
            id="yearSelect"
            value={graduationYear}
            onChange={handleYearChange}
            className="form-input w-full"
          >
            <option value="">Semua Tahun Lulus</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="statusSelect"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Status
          </label>
          <select
            id="statusSelect"
            value={status}
            onChange={handleStatusChange}
            className="form-input w-full"
          >
            <option value="">Semua Status</option>
            {statusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AlumniFilter;
