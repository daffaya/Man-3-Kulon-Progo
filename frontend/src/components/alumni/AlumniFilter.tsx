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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Cari berdasarkan NISN atau nama..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 form-input w-full"
        />
      </div>
      <div>
        <select
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
  );
};

export default AlumniFilter;
