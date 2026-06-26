// src/pages/layanan/pmbm/usePmbmConfig.ts

/**
 * @fileoverview usePmbmConfig — replaces pmbmConfig.ts.
 * Fetches PMBM configuration from CMS (page: pmbm, section: config).
 * Computes PENDAFTARAN_DITUTUP and exposes all config values reactively.
 *
 * Usage:
 *   const { config, loading } = usePmbmConfig();
 *   config.PENDAFTARAN_DITUTUP
 *   config.GELOMBANG_AKTIF   // 1 | 2 | null
 *   config.GELOMBANG_TAMPIL  // 1 | 2
 */

import { useCmsSection } from "../../../hooks/useCmsPage";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PmbmConfigRaw {
  gelombang_aktif: 1 | 2 | null;
  gelombang_tampil: 1 | 2;
  batas_g1: string;
  batas_g2: string;
}

export interface PmbmConfig {
  GELOMBANG_AKTIF: 1 | 2 | null;
  GELOMBANG_TAMPIL: 1 | 2;
  PENDAFTARAN_DITUTUP: boolean;
  REGISTRATION_LINK: string;
}

// ─────────────────────────────────────────────
// Helper — same logic as original pmbmConfig.ts
// ─────────────────────────────────────────────

const isMelewatiBatas = (
  gelombangAktif: 1 | 2 | null,
  batas: Record<number, string>,
): boolean => {
  if (!gelombangAktif) return true;
  const batasStr = batas[gelombangAktif];
  if (!batasStr) return false;

  const now = new Date();
  const batasDate = new Date(batasStr);
  batasDate.setHours(23, 59, 59, 999);

  return now > batasDate;
};

// ─────────────────────────────────────────────
// Fallback — matches current pmbmConfig.ts values
// ─────────────────────────────────────────────

const FALLBACK_RAW: PmbmConfigRaw = {
  gelombang_aktif: 2,
  gelombang_tampil: 1,
  batas_g1: "2026-04-27",
  batas_g2: "",
};

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export const usePmbmConfig = () => {
  const { data, loading } = useCmsSection<PmbmConfigRaw>("pmbm", "config");

  const raw: PmbmConfigRaw = {
    gelombang_aktif: data !== null ? data.gelombang_aktif : null, // null = ditutup saat loading
    gelombang_tampil: data?.gelombang_tampil ?? FALLBACK_RAW.gelombang_tampil,
    batas_g1: data?.batas_g1 ?? FALLBACK_RAW.batas_g1,
    batas_g2: data?.batas_g2 ?? FALLBACK_RAW.batas_g2,
  };

  const batas: Record<number, string> = {
    1: raw.batas_g1,
    2: raw.batas_g2,
  };

  const config: PmbmConfig = {
    GELOMBANG_AKTIF: raw.gelombang_aktif,
    GELOMBANG_TAMPIL: raw.gelombang_tampil,
    PENDAFTARAN_DITUTUP:
      raw.gelombang_aktif === null ||
      isMelewatiBatas(raw.gelombang_aktif, batas),
    REGISTRATION_LINK: "/layanan/pmbm-daftar",
  };

  return { config, loading };
};
