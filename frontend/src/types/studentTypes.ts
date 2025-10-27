// src/types/studentTypes.ts
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

export interface StudentFormData {
  nisn: string;
  name: string;
  class_id: number;
  academic_year: string;
  // Kolom baru
  nik?: string;
  birth_place?: string;
  birth_date?: string;
  address?: string;
  phone?: string;
  parent_name?: string;
}

export interface StudentImportData {
  nisn: string;
  name: string;
  academic_year: string;
  class_id: number;
}

export interface Class {
  id: number;
  name: string;
  academic_year: string;
  semester: string;
  total_siswa?: number;
}

// Tambahkan interface ini
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

export interface GraduateStudentsResponse {
  success: boolean;
  message: string;
  count: number;
  angkatan: string;
}

// Tipe union untuk response
export type BulkMoveOrGraduateResponse =
  | BulkMoveClassResponse
  | GraduateStudentsResponse;

export interface Angkatan {
  angkatan: string;
  count: number;
}
