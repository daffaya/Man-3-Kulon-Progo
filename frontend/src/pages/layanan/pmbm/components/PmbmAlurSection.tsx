import React from "react";
import { Lock, Bell } from "lucide-react";
import Section from "../../../../components/ui/Section";
import { PENDAFTARAN_DITUTUP } from "../pmbmConfig";
import { ALUR_G1, ALUR_G2 } from "../pmbmData";

const PmbmAlurSection: React.FC = () => {
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
            {ALUR_G1.map((item, index) => (
              <div
                key={item.nomor}
                className="flex items-start gap-4 mb-6 last:mb-0 relative"
              >
                {index < ALUR_G1.length - 1 && (
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
            {ALUR_G2.map((item, index) => (
              <div
                key={item.nomor}
                className="flex items-start gap-4 mb-6 last:mb-0 relative"
              >
                {index < ALUR_G2.length - 1 && (
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
