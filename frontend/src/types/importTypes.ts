/**
 * @fileoverview Type definitions for data import results and error handling.
 * This file defines interfaces for representing the outcome of an import operation,
 * particularly from spreadsheet files that may contain multiple worksheets.
 * It provides structures for detailed success/failure counts, error tracking,
 * and a breakdown of results per worksheet.
 */

/**
 * Represents the overall result of a multi-worksheet data import operation.
 * It includes a summary of all actions (successes, failures, updates, skips)
 * and a detailed breakdown of the results for each worksheet processed.
 */
export interface ImportResult {
  skipBreakdown: any;
  success: number;
  failed: number;
  updated: number;
  skipped: number;
  errors: ImportError[];
  worksheetDetails: { [worksheetName: string]: WorksheetResult };
}

/**
 * Represents the import result for a single worksheet within a larger file.
 * This mirrors the structure of ImportResult but is scoped to one specific worksheet.
 */
export interface WorksheetResult {
  success: number;
  failed: number;
  updated: number;
  skipped: number;
  errors: ImportError[];
}

/**
 * Represents a single error that occurred during the import process.
 * Provides context about the location and nature of the error.
 */
export interface ImportError {
  row: number;
  worksheet?: string;
  error: string;
}

/**
 * Represents the top-level API response for an import request.
 * Indicates whether the request was accepted and provides the detailed results.
 */
export interface ImportResponse {
  success: boolean;
  message?: string;
  results?: ImportResult;
}
