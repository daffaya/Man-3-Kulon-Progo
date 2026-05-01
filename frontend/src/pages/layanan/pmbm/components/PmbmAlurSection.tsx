// src/pages/layanan/pmbm/components/PmbmAlurSection.tsx

import React from "react";
import { Lock, Bell } from "lucide-react";
import Section from "../../../../components/ui/Section";
import type { PmbmConfig } from "../usePmbmConfig";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface AlurItem {
  nomor: number;
  judul: string;
  deskripsi: string;
}

interface PmbmAlurSectionProps {
  config: PmbmConfig;
  alurG1: AlurItem[];
  alurG2: AlurItem[];
}

// ─────────────────────────────────────────────
// Fallback
// ─────────────────────────────────────────────

const FALLBACK_G1: AlurItem[] = [
  {
    nomor: 1,
    judul: "Daftar Online",
    deskripsi:
      "Isi formulir pendaftaran melalui sistem online MAN 3 Kulon Progo.",
  },
  {
    nomor: 2,
    judul: "Unggah Dokumen",
    deskripsi:
      "Upload KK, akta kelahiran, ijazah, dan dokumen pendukung sesuai jalur.",
  },
  {
    nomor: 3,
    judul: "Seleksi",
    deskripsi:
      "Ikuti proses seleksi sesuai jalur (tes keterampilan, verifikasi dokumen, dsb.).",
  },
  {
    nomor: 4,
    judul: "Pengumuman Hasil",
    deskripsi: "Tunggu pengumuman resmi hasil seleksi dari panitia PMBM.",
  },
  {
    nomor: 5,
    judul: "Lapor Diri",
    deskripsi:
      "Siswa yang diterima wajib lapor diri secara offline di MAN 3 Kulon Progo.",
  },
];

const FALLBACK_G2: AlurItem[] = [
  {
    nomor: 1,
    judul: "Daftar Online",
    deskripsi: "Isi formulir pendaftaran Gelombang II melalui sistem online.",
  },
  {
    nomor: 2,
    judul: "Datang untuk Tes",
    deskripsi:
      "Hadir langsung ke MAN 3 Kulon Progo pada jadwal pelaksanaan tes.",
  },
  {
    nomor: 3,
    judul: "Ikuti Tes",
    deskripsi: "Ikuti seleksi tes yang diselenggarakan secara on site.",
  },
  {
    nomor: 4,
    judul: "Pengumuman Hasil",
    deskripsi: "Tunggu pengumuman resmi hasil tes dari panitia PMBM.",
  },
  {
    nomor: 5,
    judul: "Lapor Diri",
    deskripsi:
      "Siswa yang diterima wajib lapor diri secara offline di MAN 3 Kulon Progo.",
  },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const PmbmAlurSection: React.FC<PmbmAlurSectionProps> = ({
  config,
  alurG1,
  alurG2,
}) => {
  const { PENDAFTARAN_DITUTUP } = config;

  const g1 = alurG1.length > 0 ? alurG1 : FALLBACK_G1;
  const g2 = alurG2.length > 0 ? alurG2 : FALLBACK_G2;

  return (
    <Section id="alur" title="Alur Pendaftaran PMBM" bg="default">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Alur G1 */}
        <div className="opacity-60">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lock size={15} className="text-secondary" />
            Gelombang I
            <span className="text-xs font-normal text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
              Ditutup
            </span>
          </h3>
          <div className="relative">
            {g1.map((item, index) => (
              <div
                key={item.nomor}
                className="flex items-start gap-4 mb-6 last:mb-0 relative"
              >
                {index < g1.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-secondary/20 hidden md:block" />
                )}
                <div className="bg-secondary/20 text-secondary rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm z-10 flex-shrink-0">
                  {item.nomor}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {item.judul}
                  </h4>
                  <p className="text-secondary text-sm">{item.deskripsi}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alur G2 */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell size={15} className="text-accent" />
            Gelombang II
            {!PENDAFTARAN_DITUTUP && (
              <span className="text-xs font-normal text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                Sedang Dibuka
              </span>
            )}
          </h3>
          <div className="relative">
            {g2.map((item, index) => (
              <div
                key={item.nomor}
                className="flex items-start gap-4 mb-6 last:mb-0 relative"
              >
                {index < g2.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-accent/30 hidden md:block" />
                )}
                <div className="bg-accent text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm z-10 flex-shrink-0 shadow-md">
                  {item.nomor}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {item.judul}
                  </h4>
                  <p className="text-secondary text-sm">{item.deskripsi}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default PmbmAlurSection;
