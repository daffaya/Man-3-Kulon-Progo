/**
 * @fileoverview Type definitions for archive-related data structures.
 * This file defines TypeScript interfaces for categories, archives, and form states
 * used throughout the archive management system.
 */

/**
 * Represents a category in the archive system.
 */
export interface Category {
  id: number;
  name: string;
  description: string | null;
}

/**
 * Represents an archived document with metadata.
 */
export interface Archive {
  id: number;
  file_name: string;
  description: string | null;
  category_name: string | null;
  document_number: string | null;
  document_date: string | null;
  upload_date: string;
}

/**
 * Represents the state of the edit form for archive entries.
 */
export interface EditFormState {
  file: File | null;
  description: string;
  categoryId: string;
  documentNumber: string;
  documentDate: string;
}
