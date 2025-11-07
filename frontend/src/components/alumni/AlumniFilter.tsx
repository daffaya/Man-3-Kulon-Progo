import React from "react";
import { Search } from "lucide-react";

interface AlumniFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  graduationYear: string;
  setGraduationYear: (year: string) => void;
  years: string[];
}

const AlumniFilter: React.FC<AlumniFilterProps> = ({
  searchQuery,
  setSearchQuery,
  graduationYear,
  setGraduationYear,
  years,
}) => {
  return (
    <div className="card p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Cari berdasarkan NISN atau nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            onChange={(e) => setGraduationYear(e.target.value)}
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
      </div>
    </div>
  );
};

export default AlumniFilter;
