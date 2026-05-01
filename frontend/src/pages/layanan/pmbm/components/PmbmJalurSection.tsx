// src/pages/layanan/pmbm/components/PmbmJalurSection.tsx

import React from "react";
import {
  Lock,
  Bell,
  CheckCircle,
  ClipboardCheck,
  BookOpen,
  Shield,
  Wrench,
  Star,
  Heart,
} from "lucide-react";
import Section from "../../../../components/ui/Section";
import type { PmbmConfig } from "../usePmbmConfig";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface JalurItem {
  nama: string;
  deskripsi: string;
  syarat: string[];
}

interface JalurG2 {
  deskripsi: string;
  syarat: string[];
}

interface PmbmJalurSectionProps {
  config: PmbmConfig;
  jalurG1: JalurItem[];
  jalurG2: JalurG2;
}

// ─────────────────────────────────────────────
// Icon map — nama jalur → icon
// Icons stay in frontend (React components can't be stored in DB)
// ─────────────────────────────────────────────

const JALUR_ICONS: Record<string, React.ElementType> = {
  Tahfidz: BookOpen,
  KKO: Shield,
  Keterampilan: Wrench,
  "Akademik / Non-Akademik": Star,
  Afirmasi: Heart,
};

const DEFAULT_ICON = CheckCircle;

// ─────────────────────────────────────────────
// Fallback
// ─────────────────────────────────────────────

const FALLBACK_G1: JalurItem[] = [
  {
    nama: "Tahfidz",
    deskripsi: "Khusus siswa berprestasi hafalan Al-Qur'an.",
    syarat: ["Sertifikat Tahfidz", "Hafalan juz (sesuai ketentuan)"],
  },
  {
    nama: "KKO",
    deskripsi:
      "Kelas Khusus Olahraga — bagi siswa berbakat olahraga, termasuk bela diri.",
    syarat: ["Sertifikat OR (Organisasi / Kepramukaan)", "Tes Kemampuan Dasar"],
  },
  {
    nama: "Keterampilan",
    deskripsi: "Tiga pilihan: Tata Busana, Multimedia, dan TITL.",
    syarat: ["Tes seleksi keterampilan sesuai pilihan"],
  },
  {
    nama: "Akademik / Non-Akademik",
    deskripsi: "Jalur umum berdasarkan prestasi akademik atau non-akademik.",
    syarat: [
      "Akademik: Nilai rapor semester 1–5",
      "Non-Akademik: Sertifikat kejuaraan",
    ],
  },
  {
    nama: "Afirmasi",
    deskripsi: "Kuota khusus bagi putra-putri warga Pantog Wetan.",
    syarat: ["Warga Pantog Wetan"],
  },
];

const FALLBACK_G2: JalurG2 = {
  deskripsi:
    "Gelombang II menggunakan jalur tes yang dilaksanakan langsung (on site) di MAN 3 Kulon Progo.",
  syarat: [
    "Surat Keterangan Aktif",
    "Scan KK & Akta Kelahiran",
    "Ijazah SMP/MTs",
  ],
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const PmbmJalurSection: React.FC<PmbmJalurSectionProps> = ({
  config,
  jalurG1,
  jalurG2,
}) => {
  const { PENDAFTARAN_DITUTUP } = config;

  const items = jalurG1.length > 0 ? jalurG1 : FALLBACK_G1;
  const g2 = jalurG2.deskripsi ? jalurG2 : FALLBACK_G2;

  return (
    <Section id="jalur" title="Jalur Pendaftaran">
      {/* Gelombang I */}
      <div className="mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
            <Lock size={13} />
            Gelombang I — Jalur Khusus — Ditutup
          </span>
        </div>
        <p className="text-center text-secondary mb-6 max-w-2xl mx-auto text-sm">
          Pendaftaran Gelombang I telah ditutup. Informasi jalur berikut
          disimpan sebagai referensi.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
          {items.map((item) => {
            const Icon = JALUR_ICONS[item.nama] ?? DEFAULT_ICON;
            return (
              <div
                key={item.nama}
                className="bg-[rgb(var(--color-background))] border border-[rgb(var(--color-secondary))]/20 rounded-xl p-6 shadow-sm"
              >
                <div className="mb-4">
                  <div className="bg-secondary/10 p-3 rounded-full inline-flex">
                    <Icon className="text-secondary" size={24} />
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-foreground">
                  {item.nama}
                </h3>
                <p className="text-secondary text-sm mb-4">{item.deskripsi}</p>
                <div className="space-y-2">
                  {(item.syarat ?? []).map((s) => (
                    <div key={s} className="flex items-start gap-2">
                      <CheckCircle
                        className="text-secondary flex-shrink-0 mt-0.5"
                        size={14}
                      />
                      <span className="text-sm text-secondary">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gelombang II */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
            {PENDAFTARAN_DITUTUP ? (
              <>
                <Lock size={13} /> Gelombang II — Jalur Tes — Ditutup
              </>
            ) : (
              <>
                <Bell size={13} /> Gelombang II — Jalur Tes — Sedang Dibuka
              </>
            )}
          </span>
        </div>
        <p className="text-center text-secondary mb-6 max-w-2xl mx-auto text-sm">
          {g2.deskripsi}
        </p>

        <div className="max-w-md mx-auto">
          <div className="group bg-[rgb(var(--color-background))] border-2 border-accent/30 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="mb-4">
                <div className="bg-accent/20 p-3 rounded-full inline-flex group-hover:bg-accent/30 transition-all duration-300">
                  <ClipboardCheck className="text-accent" size={24} />
                </div>
              </div>
              <h3 className="font-bold text-xl mb-2 text-foreground">
                Jalur Tes
              </h3>
              <p className="text-secondary text-sm mb-4">{g2.deskripsi}</p>
              <div className="space-y-2">
                {(g2.syarat ?? []).map((s) => (
                  <div key={s} className="flex items-start gap-2">
                    <CheckCircle
                      className="text-accent flex-shrink-0 mt-0.5"
                      size={14}
                    />
                    <span className="text-sm text-secondary">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default PmbmJalurSection;
