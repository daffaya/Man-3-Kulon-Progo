/**
 * @fileoverview API client for academic years and the new-year wizard.
 * The active year is never stored: `is_current` is computed by the server
 * from today's date.
 */
import { apiFetch } from "../lib/api";

export interface AcademicYear {
  id: number;
  label: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface TransitionPlan {
  from_year: AcademicYear;
  to_year: AcademicYear;
  classes_to_create: { name: string; grade_level: number }[];
  promotions: {
    from_class_id: number;
    from_class: string;
    to_class_id: number | null;
    to_class: string;
    students: number;
  }[];
  graduations: { from_class_id: number; from_class: string; students: number }[];
  totals: { promote: number; graduate: number };
  warnings: string[];
}

export interface TransitionInput {
  from_year_id: number;
  to_year_id: number;
  new_class_counts: { X: number };
}

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export const fetchAcademicYears = (token: string): Promise<AcademicYear[]> =>
  apiFetch(`/academic-years`, { headers: auth(token) });

export const createAcademicYear = (
  data: { start_date: string; end_date: string },
  token: string,
): Promise<AcademicYear> =>
  apiFetch(`/academic-years`, {
    method: "POST",
    headers: auth(token),
    body: JSON.stringify(data),
  });

export const previewYearTransition = (
  data: TransitionInput,
  token: string,
): Promise<TransitionPlan> =>
  apiFetch(`/year-transition/preview`, {
    method: "POST",
    headers: auth(token),
    body: JSON.stringify(data),
  });

export const executeYearTransition = (
  data: TransitionInput,
  token: string,
): Promise<{
  success: boolean;
  summary: {
    classes_created: number;
    promoted: number;
    graduated: number;
    skipped: number;
  };
}> =>
  apiFetch(`/year-transition/execute`, {
    method: "POST",
    headers: auth(token),
    body: JSON.stringify({ ...data, confirm: true }),
  });
