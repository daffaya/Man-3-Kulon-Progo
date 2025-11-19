/**
 * @fileoverview Type definitions for student-related data structures.
 * This file defines TypeScript interfaces for students, classes, and API responses
 * used throughout the student management system.
 */

/**
 * Represents a student entity with comprehensive personal and academic information.
 */
export interface Student {
  id: number;
  nisn: string;
  name: string;
  academic_year: string;
  is_active: boolean;
  is_deleted: boolean;
  class_name?: string;
  class_id?: number;
  angkatan: string;
  jenis_kelamin: string;
  nik?: string;
  birth_place?: string;
  birth_date?: string;
  address?: string;
  phone?: string;
  parent_name?: string;
}

/**
 * Defines the structure for form data when creating or editing a student.
 */
export interface StudentFormData {
  nisn: string;
  name: string;
  class_id: number;
  academic_year: string;
  nik?: string;
  birth_place?: string;
  birth_date?: string;
  address?: string;
  phone?: string;
  parent_name?: string;
}

/**
 * Defines the minimal data structure for importing students in bulk.
 */
export interface StudentImportData {
  nisn: string;
  name: string;
  academic_year: string;
  class_id: number;
}

/**
 * Represents a class within an academic year and semester.
 */
export interface Class {
  id: number;
  name: string;
  academic_year: string;
  semester: string;
  total_siswa?: number;
}

/**
 * Defines the API response structure for a bulk move students operation.
 */
export interface BulkMoveClassResponse {
  success: boolean;
  message: string;
  totalInAngkatan: number;
  studentsMoved: number;
  angkatan: string;
  movedTo: string;
  fromClassName: string;
  toClassName: string;
}

/**
 * Defines the API response structure for graduating students in bulk.
 */
export interface GraduateStudentsResponse {
  success: boolean;
  message: string;
  count: number;
  angkatan: string;
}

/**
 * A union type for responses from bulk student operations (move or graduate).
 */
export type BulkMoveOrGraduateResponse =
  | BulkMoveClassResponse
  | GraduateStudentsResponse;

/**
 * Represents a student batch/cohort (angkatan) and its student count.
 */
export interface Angkatan {
  angkatan: string;
  count: number;
}
