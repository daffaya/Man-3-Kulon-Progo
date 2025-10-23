// src/types/importTypes.ts
// Update ImportResult untuk mendukung multiple worksheet dan detail hasil
export interface ImportResult {
  skipBreakdown: any;
  success: number;
  failed: number;
  updated: number;
  skipped: number;
  errors: ImportError[];
  worksheetDetails: { [worksheetName: string]: WorksheetResult };
}

export interface WorksheetResult {
  success: number;
  failed: number;
  updated: number;
  skipped: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  worksheet?: string;
  error: string;
}

export interface ImportResponse {
  success: boolean;
  message?: string;
  results?: ImportResult;
}
