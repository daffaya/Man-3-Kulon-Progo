/**
 * @fileoverview Type definitions for staff and teacher data structures.
 * This file defines TypeScript interfaces and types used throughout the staff management system,
 * including data models, form data shapes, pagination, and filtering options.
 */

/**
 * Represents a staff/teacher record.
 */
export interface Staff {
  id: number;
  type: "teacher" | "staff";
  nama: string;
  nip: string;
  gender: "L" | "P";
  status: "PNS" | "PPPK" | "CPNS";
  jabatan: string;
  created_at: string;
  updated_at: string;
}

/**
 * Data structure for creating or updating a staff/teacher.
 */
export interface StaffFormData {
  type: "teacher" | "staff";
  nama: string;
  nip: string;
  gender: "L" | "P";
  status: "PNS" | "PPPK" | "CPNS";
  jabatan: string;
}

/**
 * Represents recapitulation data for staff/teachers.
 */
export interface StaffRecap {
  status: string;
  male: number;
  female: number;
}

/**
 * Represents detailed tendik data.
 */
export interface Tendik {
  no: number;
  nama: string;
  nip: string;
  gender: "L" | "P";
  status: "PNS" | "PPPK" | "CPNS";
  jabatan: string;
}

/**
 * Filters for querying staff data.
 */
export interface StaffFilters {
  keyword?: string;
  type?: string;
  gender?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Pagination response data for staff list.
 */
export interface StaffPaginationData {
  data: Staff[];
  total: number;
  totalPages: number;
  currentPage: number;
}
