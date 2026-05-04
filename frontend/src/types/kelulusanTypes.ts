export type StatusKelulusan = "lulus" | "tidak_lulus";

export interface KelulusanResult {
  nisn: string;
  nama: string;
  kelas: string;
  status: StatusKelulusan;
  file_pengumuman: string | null;
  tahun_ajaran: string;
}

export interface KelulusanSummary {
  id: number;
  nisn: string;
  nism: string | null;
  nomor_asesmen: string | null;
  nama: string;
  kelas: string;
  status: StatusKelulusan;
  file_pengumuman: string | null;
  tahun_ajaran: string;
}
