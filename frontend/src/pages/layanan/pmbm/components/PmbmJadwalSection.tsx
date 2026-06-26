// src/pages/layanan/pmbm/components/PmbmJadwalSection.tsx

import React from "react";
import {
  Lock,
  Bell,
  Calendar,
  ClipboardList,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import Section from "../../../../components/ui/Section";
import type { PmbmConfig } from "../usePmbmConfig";

export interface JadwalItem {
  label: string;
  value: string;
}

interface PmbmJadwalSectionProps {
  config: PmbmConfig;
  jadwalG1: JadwalItem[];
  jadwalG2: JadwalItem[];
}

const JADWAL_ICONS_G1 = [Calendar, ClipboardList, Bell, FileText];
const JADWAL_ICONS_G2 = [Calendar, ClipboardCheck, Bell, FileText];

const FALLBACK_G1: JadwalItem[] = [
  {
    label: "Pendaftaran Online (Gelombang I)",
    value: "1 April – 17 April 2026",
  },
  { label: "Seleksi", value: "20 April – 22 April 2026" },
  { label: "Pengumuman Hasil Seleksi", value: "23 April 2026" },
  { label: "Lapor Diri", value: "24 April 2026" },
];

const FALLBACK_G2: JadwalItem[] = [
  { label: "Pendaftaran Online (Gelombang II)", value: "Segera diumumkan" },
  { label: "Pelaksanaan Tes", value: "Segera diumumkan" },
  { label: "Pengumuman Hasil Tes", value: "Segera diumumkan" },
  { label: "Lapor Diri", value: "Segera diumumkan" },
];

const PmbmJadwalSection: React.FC<PmbmJadwalSectionProps> = ({
  config,
  jadwalG1,
  jadwalG2,
}) => {
  const { PENDAFTARAN_DITUTUP } = config;

  const g1Items = jadwalG1.length > 0 ? jadwalG1 : FALLBACK_G1;
  const g2Items = jadwalG2.length > 0 ? jadwalG2 : FALLBACK_G2;

  return (
    <Section id="jadwal" title="Jadwal PMBM" bg="semi">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jadwal G1 */}
        <div className="card p-6 md:p-8 opacity-60">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={15} className="text-secondary" />
            <h3 className="font-semibold text-foreground">
              Gelombang I
              <span className="ml-2 text-xs font-normal text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                Ditutup
              </span>
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {g1Items.map((item, index) => {
              const Icon = JADWAL_ICONS_G1[index] ?? Calendar;
              return (
                <div key={item.label} className="flex items-start gap-3">
                  <Icon
                    className="text-secondary mt-1 flex-shrink-0"
                    size={18}
                  />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {item.label}
                    </p>
                    <p className="text-secondary text-sm">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Jadwal G2 */}
        <div
          className={`card p-6 md:p-8 ${PENDAFTARAN_DITUTUP ? "opacity-60" : "border-accent/30"}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock
              size={15}
              className={PENDAFTARAN_DITUTUP ? "text-secondary" : "text-accent"}
            />
            <h3 className="font-semibold text-foreground">
              Gelombang II
              {PENDAFTARAN_DITUTUP ? (
                <span className="ml-2 text-xs font-normal text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                  Ditutup
                </span>
              ) : (
                <span className="ml-2 text-xs font-normal text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                  Sedang Dibuka
                </span>
              )}
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {g2Items.map((item, index) => {
              const Icon = JADWAL_ICONS_G2[index] ?? Calendar;
              return (
                <div key={item.label} className="flex items-start gap-3">
                  <Icon
                    className={`${PENDAFTARAN_DITUTUP ? "text-secondary" : "text-accent"} mt-1 flex-shrink-0`}
                    size={18}
                  />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {item.label}
                    </p>
                    <p className="text-secondary text-sm">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default PmbmJadwalSection;
