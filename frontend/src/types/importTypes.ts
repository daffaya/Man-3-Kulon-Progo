/**
 * @fileoverview Types for the two-step student import (preview -> commit).
 * Step 1 classifies every row against the database without writing anything;
 * step 2 applies the batch with the actions the admin chose.
 */

/** How a file row relates to what is already in the database. */
export type ImportCategory =
  | "new"
  | "unchanged"
  | "changed"
  | "moved"
  | "error";

export interface ImportFieldDiff {
  field: string;
  old: string | null;
  new: string | null;
}

export interface ImportPreviewRow {
  row: number;
  worksheet: string;
  nisn: string;
  name: string;
  category: ImportCategory;
  class_name?: string | null;
  current_class_name?: string | null;
  diff?: ImportFieldDiff[];
  errors?: string[];
}

export interface ImportPreview {
  batch_id: number;
  /** True when a file with identical content was already committed. */
  file_seen_before: boolean;
  academic_year: { id: number; label: string };
  counts: Record<ImportCategory, number>;
  rows: ImportPreviewRow[];
}

export interface ImportActions {
  changed: "update" | "skip";
  moved: "move" | "skip";
}

export interface ImportCommitResult {
  success: boolean;
  result: {
    created: number;
    updated: number;
    moved: number;
    skipped: number;
    failed: number;
  };
}
