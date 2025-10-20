export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Archive {
  id: number;
  file_name: string;
  description: string | null;
  category_name: string | null;
  document_number: string | null;
  document_date: string | null;
  upload_date: string;
}

export interface EditFormState {
  file: File | null;
  description: string;
  categoryId: string;
  documentNumber: string;
  documentDate: string;
}
