/**
 * @fileoverview PmbmSuksesPage - Success page displayed after a successful PMBM registration submission.
 * This page shows the generated registration number and next steps for the student.
 * It redirects to the PMBM landing page if accessed directly without state data.
 */

import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Calendar,
  Phone,
  Copy,
  Home,
  ArrowRight,
} from "lucide-react";
import Layout from "../../../components/layout/Layout";
import { JALUR_LABEL } from "../../../types/pmbmTypes";
import type { JalurPendaftaran } from "../../../types/pmbmTypes";

/**
 * Shape of the location state passed from the registration wizard on success.
 */
interface LocationState {
  /** Auto-generated registration number in format PMBM-YYYY-XXXX. */
  nomor_pendaftaran: string;
  /** Full name of the registered student. */
  nama_lengkap: string;
  /** Registration track chosen by the student. */
  jalur: JalurPendaftaran;
}

/**
 * Defines the next steps shown to the student after successful registration.
 */
const NEXT_STEPS = [
  {
    icon: Calendar,
    text: "Pantau pengumuman seleksi pada 23 April 2026 melalui website MAN 3 Kulon Progo.",
  },
  {
    icon: Calendar,
    text: "Jika diterima, wajib lapor diri secara offline di MAN 3 Kulon Progo pada 24 April 2026.",
  },
  {
    icon: Calendar,
    text: "Siapkan berkas fisik: KK, akta kelahiran, ijazah, dan sertifikat prestasi (jika ada).",
  },
  {
    icon: Phone,
    text: (
      <div>
        <p>
          Jika ada pertanyaan, hubungi panitia PMBM melalui WhatsApp di bawah
          ini
        </p>

        <a
          href="https://wa.me/6285743881574"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline transition-colors"
        >
          +62 857-4388-1574
        </a>
        <span className="text-secondary text-md ml-1">(Isti Wulandari)</span>
        <br />
        <span className="text-secondary mx-2">atau</span>
        <br />
        <a
          href="https://wa.me/6283189810114"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline transition-colors"
        >
          +62 831-8981-0114
        </a>
        <span className="text-secondary text-md ml-1">(Wijiardani)</span>
      </div>
    ),
  },
];

/**
 * The PMBM registration success page.
 * Displays the registration number, student name, chosen track, and next steps.
 * Redirects to /pmbm if accessed without valid state (e.g., direct URL navigation).
 * @returns {JSX.Element | null} The rendered success page, or null while redirecting.
 */
const PmbmSuksesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  useEffect(() => {
    if (!state?.nomor_pendaftaran) {
      navigate("/layanan/pmbm", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.nomor_pendaftaran) return null;

  const { nomor_pendaftaran, nama_lengkap, jalur } = state;

  /**
   * Copies the registration number to the clipboard.
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(nomor_pendaftaran).catch(() => {});
  };

  console.log("STATE:", state);

  return (
    <Layout>
      <div className="min-h-screen bg-semibackground flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-500" size={48} />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-green-300/40 animate-ping" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Pendaftaran Berhasil!
          </h1>
          <p className="text-secondary mb-8">
            Terima kasih,{" "}
            <strong className="text-foreground">{nama_lengkap}</strong>.
            Formulir pendaftaran kamu sudah kami terima.
          </p>

          {/* Registration Number Card */}
          <div className="card p-6 mb-6 text-left">
            <p className="text-xs text-secondary uppercase tracking-wide font-semibold mb-1">
              Nomor Pendaftaran
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xl font-bold text-accent tracking-wider">
                {nomor_pendaftaran}
              </span>
              <button
                onClick={handleCopy}
                title="Salin nomor pendaftaran"
                className="p-2 rounded-lg border border-secondary/20 hover:border-accent hover:text-accent transition-colors text-secondary"
              >
                <Copy size={16} />
              </button>
            </div>
            <p className="text-xs text-secondary mt-2">
              <strong>Simpan nomor ini!</strong> Kamu akan membutuhkannya saat
              verifikasi berkas.
            </p>

            <div className="mt-4 pt-4 border-t border-secondary/10">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">Jalur:</span>
                <span className="text-secondary">{JALUR_LABEL[jalur]}</span>
              </div>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="card p-6 mb-6 text-left">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <ArrowRight size={16} className="text-accent" />
              Langkah Berikutnya
            </h3>
            <ol className="space-y-3">
              {NEXT_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-secondary">{step.text}</p>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Back to Home */}
          <button
            onClick={() => navigate("/")}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Home size={18} />
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default PmbmSuksesPage;
