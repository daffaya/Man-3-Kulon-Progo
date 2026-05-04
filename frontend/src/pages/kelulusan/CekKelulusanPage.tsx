/**
 * @fileoverview CekKelulusanPage component for checking student graduation status.
 * This component provides a time-gated announcement page with a real-time countdown
 * before access is unlocked. It allows users to input their NISN to retrieve
 * graduation results and displays outcomes with animated transitions and
 * conditional UI states (lulus, tidak lulus, not found, error).
 */

import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import kelulusanApi from "../../api/kelulusanApi";
import type { KelulusanResult } from "../../types/kelulusanTypes";

type PageState =
  | "idle"
  | "loading"
  | "found_lulus"
  | "found_tidak_lulus"
  | "not_found"
  | "error";

const OPEN_TIME = new Date("2026-05-04T10:00:00+07:00");

const CekKelulusanPage: React.FC = () => {
  const [nisn, setNisn] = useState("");
  const [state, setState] = useState<PageState>("idle");
  const [result, setResult] = useState<KelulusanResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Countdown state
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [isLastSeconds, setIsLastSeconds] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diff = OPEN_TIME.getTime() - now.getTime();

      if (diff <= 0) {
        setIsOpen(true);
        setTimeLeft("00:00:00");
        return true;
      }

      setIsLastSeconds(diff <= 10000 && diff > 0);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const format = (n: number) => String(n).padStart(2, "0");

      setTimeLeft(`${format(hours)}:${format(minutes)}:${format(seconds)}`);

      return false;
    };

    const shouldStop = updateTime();
    if (shouldStop) return;

    const interval = setInterval(() => {
      const stop = updateTime();
      if (stop) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn.trim()) return;

    setState("loading");
    setShowResult(false);
    setResult(null);

    try {
      const res = await kelulusanApi.cekKelulusan(nisn.trim());
      setResult(res.data);

      setTimeout(() => {
        setState(
          res.data.status === "lulus" ? "found_lulus" : "found_tidak_lulus",
        );
        setTimeout(() => setShowResult(true), 100);
      }, 2000);
    } catch (error: any) {
      if (error.message?.includes("tidak ditemukan") || error.status === 404) {
        setTimeout(() => {
          setState("not_found");
          setTimeout(() => setShowResult(true), 100);
        }, 1500);
      } else {
        setState("error");
      }
    }
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setNisn("");
    setShowResult(false);
  };

  /**
   * ───────────────────────────────
   * PRE-OPEN SCREEN (SNBT VIBE)
   * ───────────────────────────────
   */
  if (!isOpen) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
          <div className="absolute w-[500px] h-[500px] bg-accent/10 blur-3xl rounded-full top-1/3 left-1/2 -translate-x-1/2" />

          <div className="relative z-10 text-center max-w-md w-full">
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
              Pengumuman Kelulusan
            </h1>

            <p className="text-secondary text-sm mb-6">
              MAN 3 Kulon Progo • TA 2025/2026
            </p>

            <div className="card p-10 shadow-xl backdrop-blur-md bg-semibackground/80">
              <p className="text-secondary text-sm mb-2">
                Pengumuman akan dibuka dalam
              </p>

              {/* COUNTDOWN */}
              <div
                className={`
                  font-mono font-bold tracking-widest
                  transition-all duration-300
                  ${
                    isLastSeconds
                      ? "text-error text-5xl scale-110 animate-[pulse_0.5s_ease-in-out_infinite]"
                      : "text-accent text-4xl"
                  }
                `}
              >
                {timeLeft}
              </div>

              <p className="mt-4 text-sm text-secondary">
                {isLastSeconds
                  ? "Bersiap... hasil akan segera muncul"
                  : "Harap menunggu hingga waktu pengumuman"}
              </p>

              {isLastSeconds && (
                <p className="mt-2 text-xs text-error animate-pulse">
                  Jangan refresh halaman
                </p>
              )}

              <div className="mt-6 text-xs text-muted">
                Dibuka: 04 Mei 2026 • 10:00 WIB
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  /**
   * ───────────────────────────────
   * MAIN PAGE
   * ───────────────────────────────
   */

  return (
    <Layout>
      <div className="min-h-screen bg-semibackground flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* ── Header ── */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Pengumuman Kelulusan
            </h1>
            <p className="text-secondary mt-2 text-sm">
              MAN 3 Kulon Progo — TA 2025/2026
            </p>
          </div>

          {/* ── Idle: Form input ── */}
          {state === "idle" && (
            <div className="card p-8 shadow-lg">
              <p className="text-secondary text-sm text-center mb-6">
                Masukkan NISN untuk melihat hasil perjuanganmu selama di bangku
                sekolah.
              </p>
              <form onSubmit={handleCek} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    NISN
                  </label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="Masukkan NISN kamu"
                    maxLength={10}
                    className="form-input w-full text-center text-lg tracking-widest"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={!nisn.trim()}
                  className="btn btn-primary w-full py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Cek Kelulusan
                </button>
              </form>
            </div>
          )}

          {/* ── Loading: Build up tension ── */}
          {state === "loading" && (
            <div className="card p-12 shadow-lg text-center">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-accent animate-spin" />
              </div>
              <p className="text-foreground font-semibold text-lg animate-pulse">
                Sedang membaca hasil perjuanganmu...
              </p>
              <p className="text-secondary text-sm mt-2">
                Mohon tunggu sebentar, ya.
              </p>
            </div>
          )}

          {/* ── LULUS ── */}
          {state === "found_lulus" && (
            <>
              {/* Confetti — CSS only */}
              <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-sm opacity-0"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `-10px`,
                      backgroundColor: [
                        "#22c55e",
                        "#3b82f6",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                        "#ec4899",
                      ][Math.floor(Math.random() * 6)],
                      animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 1}s forwards`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                  />
                ))}
              </div>

              <div
                className={`card p-8 shadow-xl text-center border-2 border-green-400/50 transition-all duration-700 ${
                  showResult ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div
                    className={`bg-green-100 dark:bg-green-900/30 p-5 rounded-full transition-all duration-500 delay-200 ${
                      showResult ? "scale-100" : "scale-0"
                    }`}
                  >
                    <span className="text-5xl">🎓</span>
                  </div>
                </div>

                {/* Status */}
                <div
                  className={`transition-all duration-500 delay-300 ${
                    showResult
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <p className="text-green-600 dark:text-green-400 font-bold text-2xl mb-2">
                    Selamat <br />
                    {result?.nama}
                  </p>
                  <p className="text-secondary text-sm mb-4">
                    {result?.kelas} · {result?.tahun_ajaran}
                  </p>

                  <p className="text-foreground text-sm leading-relaxed mb-4">
                    Kamu dinyatakan <span className="font-bold">LULUS</span>{" "}
                    dari MAN 3 Kulon Progo.
                  </p>
                  <div className="space-y-3 mb-4 text-sm text-secondary leading-relaxed">
                    <p>
                      Teriring doa:{" "}
                      <span className="italic">
                        "Barakallah fii ilmi, semoga ilmu yang kamu miliki
                        membawa berkah dan kemanfaatan bagi agama dan bangsa."
                      </span>
                    </p>
                  </div>
                  {result?.file_pengumuman && (
                    <div className="pt-2">
                      <p className="text-secondary mb-3">
                        Silahkan unduh file Pengumuman Kelulusan di bawah ini:
                      </p>

                      <a
                        href={result.file_pengumuman}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary inline-block text-sm"
                      >
                        Unduh Pengumuman Kelulusan
                      </a>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleReset}
                  className="btn btn-secondary mt-6 text-sm"
                >
                  Cek NISN Lain
                </button>
              </div>
            </>
          )}

          {/* ── TIDAK LULUS ── */}
          {state === "found_tidak_lulus" && (
            <div
              className={`card p-8 shadow-lg text-center transition-all duration-700 ${
                showResult ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 dark:bg-red-900/20 p-5 rounded-full">
                  <span className="text-5xl">📋</span>
                </div>
              </div>

              <p className="text-foreground font-bold text-xl mb-1">
                {result?.nama}
              </p>
              <p className="text-secondary text-sm mb-4">
                {result?.kelas} · {result?.tahun_ajaran}
              </p>
              <div className="inline-block bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold px-6 py-2 rounded-full mb-4">
                Belum Lulus
              </div>
              <p className="text-secondary text-sm">
                Terima kasih sudah berjuang sampai sejauh ini. Hasil hari ini
                bukan akhir dari segalanya, masih banyak jalan untuk melanjutkan
                langkahmu. Tetap semangat dan jangan berhenti berusaha.
              </p>

              <button
                onClick={handleReset}
                className="btn btn-secondary mt-6 text-sm"
              >
                Cek NISN Lain
              </button>
            </div>
          )}

          {/* ── Not Found ── */}
          {state === "not_found" && (
            <div
              className={`card p-8 shadow-lg text-center transition-all duration-700 ${
                showResult ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-5 rounded-full">
                  <span className="text-4xl">🔍</span>
                </div>
              </div>
              <p className="text-foreground font-semibold text-lg mb-2">
                Data NISN tidak ditemukan
              </p>
              <p className="text-secondary text-sm mb-6">
                NISN <strong className="text-foreground">{nisn}</strong> tidak
                ditemukan. Pastikan kembali NISN yang kamu masukkan sudah benar.
                Jika masih ada kendala, silakan hubungi pihak sekolah.
              </p>
              <button onClick={handleReset} className="btn btn-primary text-sm">
                Coba Lagi
              </button>
            </div>
          )}

          {/* ── Error ── */}
          {state === "error" && (
            <div className="card p-8 shadow-lg text-center">
              <p className="text-foreground font-semibold mb-2">
                Terjadi Kesalahan
              </p>
              <p className="text-secondary text-sm mb-6">
                Gagal menghubungi server. Periksa koneksi internet kamu dan coba
                lagi.
              </p>
              <button onClick={handleReset} className="btn btn-primary text-sm">
                Coba Lagi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confetti animation keyframes */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </Layout>
  );
};

export default CekKelulusanPage;
