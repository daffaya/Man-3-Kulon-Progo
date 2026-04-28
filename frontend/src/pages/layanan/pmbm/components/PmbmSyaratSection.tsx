import React from "react";
import {
  CheckCircle,
  ClipboardList,
  FileText,
  Users,
  Award,
} from "lucide-react";
import Section from "../../../../components/ui/Section";
import {
  SYARAT_UMUM,
  DATA_SISWA,
  DATA_ORTU,
  DOKUMEN_PRESTASI,
} from "../pmbmData";

const PmbmSyaratSection: React.FC = () => {
  return (
    <Section id="syarat" title="Syarat & Data Pendaftaran">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Syarat Umum */}
        <div className="card p-6 md:p-8">
          <h3 className="font-bold text-xl mb-4 text-foreground flex items-center gap-2">
            <ClipboardList className="text-accent" size={20} />
            Syarat Umum
          </h3>
          <ul className="space-y-3">
            {SYARAT_UMUM.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle
                  className="text-accent mt-0.5 flex-shrink-0"
                  size={18}
                />
                <span className="text-secondary">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Data Siswa */}
        <div className="card p-6 md:p-8">
          <h3 className="font-bold text-xl mb-4 text-foreground flex items-center gap-2">
            <FileText className="text-accent" size={20} />
            Data Siswa yang Perlu Disiapkan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DATA_SISWA.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                <span className="text-secondary text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Orang Tua */}
        <div className="card p-6 md:p-8">
          <h3 className="font-bold text-xl mb-4 text-foreground flex items-center gap-2">
            <Users className="text-accent" size={20} />
            Data Orang Tua
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DATA_ORTU.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                <span className="text-secondary text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dokumen Prestasi */}
        <div className="card p-6 md:p-8 opacity-70">
          <h3 className="font-bold text-xl mb-1 text-foreground flex items-center gap-2">
            <Award className="text-secondary" size={20} />
            Dokumen Prestasi
            <span className="text-xs font-normal text-secondary bg-secondary/10 px-2 py-0.5 rounded-full ml-1">
              Gelombang I saja
            </span>
          </h3>
          <p className="text-xs text-secondary mb-4">
            Dokumen ini hanya diperlukan untuk pendaftaran Gelombang I.
          </p>
          <ul className="space-y-3">
            {DOKUMEN_PRESTASI.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle
                  className="text-secondary mt-0.5 flex-shrink-0"
                  size={18}
                />
                <span className="text-secondary">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Catatan */}
        <div className="p-4 bg-accent/10 rounded-lg">
          <p className="text-sm text-secondary">
            <strong className="text-accent">Catatan:</strong> Persyaratan
            tambahan berlaku sesuai jalur dan gelombang pendaftaran yang
            dipilih. Data persyaratan dapat berubah mengikuti kebijakan panitia
            PMBM MAN 3 Kulon Progo TA 2026/2027.
          </p>
        </div>
      </div>
    </Section>
  );
};

export default PmbmSyaratSection;
