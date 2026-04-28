import React from "react";
import { CalendarX, ArrowLeft, ClipboardList } from "lucide-react";
import Layout from "../../../components/layout/Layout";
import { GELOMBANG_AKTIF, BATAS_PENDAFTARAN } from "./pmbmConfig";

const PmbmTutupNotice: React.FC = () => {
  const gelombangTerakhir = Math.max(
    ...Object.entries(BATAS_PENDAFTARAN)
      .filter(([, tanggal]) => tanggal)
      .map(([g]) => Number(g)),
    1,
  );
  const tanggalTutup = BATAS_PENDAFTARAN[gelombangTerakhir];

  return (
    <Layout>
      <div className="min-h-screen bg-semibackground flex items-center justify-center px-4 py-16">
        <div className="max-w-md md:max-w-xl w-full text-center">
          <div className="card p-8 md:p-10 shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="bg-accent/10 p-5 rounded-full">
                <CalendarX className="text-accent" size={48} />
              </div>
            </div>

            <h1 className="text-2xl font-serif font-bold text-foreground mb-3">
              Pendaftaran Ditutup
            </h1>

            <p className="text-secondary mb-2">
              Pendaftaran PMBM MAN 3 Kulon Progo{" "}
              <strong className="text-foreground">
                Gelombang {gelombangTerakhir}
              </strong>{" "}
              telah ditutup pada{" "}
              <strong className="text-foreground">{tanggalTutup}</strong>.
            </p>

            <p className="text-secondary text-sm mb-8">
              Pantau terus informasi Gelombang berikutnya melalui website dan
              media sosial resmi kami.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/layanan/pmbm"
                className="btn btn-primary flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Kembali ke Info PMBM
              </a>

              <a
                href="/layanan/pmbm/status"
                className="btn btn-secondary flex items-center justify-center gap-2"
              >
                <ClipboardList size={18} />
                Cek Status Pendaftaran
              </a>
            </div>
          </div>

          <p className="text-xs text-secondary mt-4">
            Untuk pertanyaan lebih lanjut, hubungi panitia PMBM melalui kontak
            yang tersedia di{" "}
            <a href="/layanan/pmbm" className="text-accent hover:underline">
              halaman informasi
            </a>
            .
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PmbmTutupNotice;
