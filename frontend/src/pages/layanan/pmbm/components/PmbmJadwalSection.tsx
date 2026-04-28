import React from "react";
import { Lock, Bell } from "lucide-react";
import Section from "../../../../components/ui/Section";
import { PENDAFTARAN_DITUTUP } from "../pmbmConfig";
import { JADWAL_G1, JADWAL_G2 } from "../pmbmData";

const PmbmJadwalSection: React.FC = () => {
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
            {JADWAL_G1.map((item) => {
              const Icon = item.icon;
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
        <div className="card p-6 md:p-8 border-accent/30">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={15} className="text-accent" />
            <h3 className="font-semibold text-foreground">
              Gelombang II
              {!PENDAFTARAN_DITUTUP && (
                <span className="ml-2 text-xs font-normal text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                  Sedang Dibuka
                </span>
              )}
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {JADWAL_G2.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-3">
                  <Icon className="text-accent mt-1 flex-shrink-0" size={18} />
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
