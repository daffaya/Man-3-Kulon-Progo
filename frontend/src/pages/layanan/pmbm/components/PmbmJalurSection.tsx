import React from "react";
import { Lock, Bell, CheckCircle, ClipboardCheck } from "lucide-react";
import Section from "../../../../components/ui/Section";
import { PENDAFTARAN_DITUTUP } from "../pmbmConfig";
import { JALUR_PENDAFTARAN } from "../pmbmData";

const PmbmJalurSection: React.FC = () => {
  return (
    <Section id="jalur" title="Jalur Pendaftaran">
      {/* ── Gelombang I ── */}
      <div className="mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
            <Lock size={13} />
            Gelombang I — Jalur Khusus — Ditutup
          </span>
        </div>
        <p className="text-center text-secondary mb-6 max-w-2xl mx-auto text-sm">
          Pendaftaran Gelombang I telah ditutup pada{" "}
          <strong className="text-foreground">17 April 2026</strong>. Informasi
          jalur berikut disimpan sebagai referensi.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
          {JALUR_PENDAFTARAN.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.nama} // Best practice: menghindari penggunaan index sebagai key
                className="bg-[rgb(var(--color-background))] border border-[rgb(var(--color-secondary))]/20 rounded-xl p-6 shadow-sm relative overflow-hidden"
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
                  {item.syarat.map((s) => (
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

      {/* ── Gelombang II ── */}
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
          Gelombang II menggunakan jalur tes yang dilaksanakan langsung (on
          site) di MAN 3 Kulon Progo.
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
              <p className="text-secondary text-sm mb-4">
                Seleksi dilakukan melalui tes tertulis secara langsung di MAN 3
                Kulon Progo. Terbuka untuk semua calon siswa.
              </p>
              <div className="space-y-2">
                {[
                  "Surat Keterangan Aktif",
                  "Scan KK & Akta Kelahiran",
                  "Ijazah SMP/MTs",
                ].map((s) => (
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
