/**
 * @fileoverview Type definitions for Alumni entities and API responses.
 * This module defines TypeScript interfaces representing alumni data,
 * filtering options, and the structure of paginated API responses.
 */

export interface Alumni {
  id: number;
  student_id: number;
  nisn: string;
  name: string;
  graduation_year: string;
  last_class_id?: number;
  last_class_name: string;
  last_academic_year: string;
  status?: string;
  workplace?: string;
  business?: string;
  university?: string;
}

export interface AlumniFilter {
  search?: string;
  graduationYear?: string;
  page?: number;
  limit?: number;
}

export interface AlumniResponse {
  data: Alumni[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalAlumni: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
