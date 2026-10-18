/**
 * @fileoverview Wizard for starting a new academic year (super_admin only).
 * Steps: 1) choose/create the target year, 2) number of new class X groups,
 * 3) review the plan (classes, promotions, graduation, warnings),
 * 4) confirm and run. Nothing is written before the final confirmation, and
 * running it twice changes nothing more.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  AcademicYear,
  TransitionPlan,
  createAcademicYear,
  executeYearTransition,
  fetchAcademicYears,
  previewYearTransition,
} from "../../api/academicYearApi";
import { AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_TITLES: Record<Exclude<Step, 5>, string> = {
  1: "Tahun ajaran",
  2: "Kelas X baru",
  3: "Pratinjau",
  4: "Konfirmasi",
};

const YearTransitionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isLoadingAuth } = useAuth();
  const { showErrorToast, showSuccessToast } = useToastMessage();

  const [step, setStep] = useState<Step>(1);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [fromId, setFromId] = useState<number>(0);
  const [toId, setToId] = useState<number>(0);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [classX, setClassX] = useState<number>(0);
  const [plan, setPlan] = useState<TransitionPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    classes_created: number;
    promoted: number;
    graduated: number;
    skipped: number;
  } | null>(null);

  const loadYears = useCallback(async () => {
    if (!token) return;
    try {
      const list = await fetchAcademicYears(token);
      setYears(list);
      return list;
    } catch (err: any) {
      showErrorToast(err?.message || "Gagal memuat tahun ajaran");
    }
  }, [token, showErrorToast]);

  useEffect(() => {
    loadYears().then((list) => {
      if (!list || list.length === 0) return;
      const current = list.find((y) => y.is_current) || list[list.length - 1];
      setFromId((prev) => prev || current.id);
      const later = list.find((y) => y.start_date >= current.end_date);
      if (later) setToId((prev) => prev || later.id);
    });
  }, [loadYears]);

  if (isLoadingAuth) return null;

  if (user?.role !== "super_admin") {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-12 text-center text-secondary">
          Hanya Super Admin yang dapat membuka halaman ini.
        </div>
      </AdminLayout>
    );
  }

  const createYear = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const created = await createAcademicYear(
        { start_date: newStart, end_date: newEnd },
        token,
      );
      showSuccessToast(`Tahun ajaran ${created.label} dibuat`);
      await loadYears();
      setToId(created.id);
      setNewStart("");
      setNewEnd("");
    } catch (err: any) {
      showErrorToast(err?.data?.error || err?.message || "Gagal membuat tahun ajaran");
    } finally {
      setBusy(false);
    }
  };

  const input = () => ({
    from_year_id: fromId,
    to_year_id: toId,
    new_class_counts: { X: classX },
  });

  const buildPreview = async () => {
    if (!token) return;
    setBusy(true);
    try {
      setPlan(await previewYearTransition(input(), token));
      setStep(3);
    } catch (err: any) {
      showErrorToast(err?.data?.error || err?.message || "Gagal menyusun pratinjau");
    } finally {
      setBusy(false);
    }
  };

  const run = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const out = await executeYearTransition(input(), token);
      setResult(out.summary);
      setStep(5);
    } catch (err: any) {
      showErrorToast(err?.data?.error || err?.message || "Gagal menjalankan transisi");
    } finally {
      setBusy(false);
    }
  };

  const fromYear = years.find((y) => y.id === fromId);
  const toYear = years.find((y) => y.id === toId);
  const yearsOk = fromYear && toYear && toYear.start_date >= fromYear.end_date;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
        <button
          onClick={() => navigate("/atmin/presensi/students")}
          className="flex items-center text-sm text-secondary hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
        </button>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
          Tahun Ajaran Baru
        </h1>
        <p className="text-secondary mb-6">
          Naikkan kelas X dan XI, luluskan kelas XII, dan buat kelas tahun ajaran baru.
        </p>

        {step < 5 && (
          <ol className="flex gap-2 mb-6 text-sm">
            {(Object.keys(STEP_TITLES) as unknown as Exclude<Step, 5>[]).map((k) => (
              <li
                key={k}
                className={`px-3 py-1 rounded-full ${
                  Number(k) === step
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {k}. {STEP_TITLES[Number(k) as Exclude<Step, 5>]}
              </li>
            ))}
          </ol>
        )}

        {step === 1 && (
          <div className="card p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="from-year" className="block text-sm font-medium mb-1">
                  Tahun ajaran asal
                </label>
                <select
                  id="from-year"
                  className="form-input w-full"
                  value={fromId}
                  onChange={(e) => setFromId(Number(e.target.value))}
                >
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.label}
                      {y.is_current ? " (berjalan)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="to-year" className="block text-sm font-medium mb-1">
                  Tahun ajaran tujuan
                </label>
                <select
                  id="to-year"
                  className="form-input w-full"
                  value={toId}
                  onChange={(e) => setToId(Number(e.target.value))}
                >
                  <option value={0}>Pilih tahun ajaran</option>
                  {years
                    .filter((y) => fromYear && y.start_date >= fromYear.end_date)
                    .map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h2 className="font-semibold mb-2">Belum ada tahun ajaran tujuan?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label htmlFor="new-start" className="block text-sm mb-1">
                    Mulai (biasanya 1 Juli)
                  </label>
                  <input
                    id="new-start"
                    type="date"
                    className="form-input w-full"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="new-end" className="block text-sm mb-1">
                    Berakhir (1 Juli tahun berikutnya)
                  </label>
                  <input
                    id="new-end"
                    type="date"
                    className="form-input w-full"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={busy || !newStart || !newEnd}
                  onClick={createYear}
                >
                  Buat tahun ajaran
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="btn btn-primary"
                disabled={!yearsOk}
                onClick={() => setStep(2)}
              >
                Lanjut
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card p-6 space-y-4">
            <div>
              <label htmlFor="class-x" className="block text-sm font-medium mb-1">
                Jumlah rombel kelas X baru (X-A, X-B, ...)
              </label>
              <input
                id="class-x"
                type="number"
                min={0}
                max={26}
                className="form-input w-32"
                value={classX}
                onChange={(e) => setClassX(Math.max(0, Number(e.target.value) || 0))}
              />
              <p className="text-xs text-secondary mt-1">
                Kelas XI dan XII dibuat otomatis dari kelas yang naik. Siswa baru
                kelas X dimasukkan lewat menu Import setelah transisi.
              </p>
            </div>
            <div className="flex justify-between">
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                Kembali
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={buildPreview}
              >
                {busy ? "Menyusun..." : "Lihat pratinjau"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && plan && (
          <div className="card p-6 space-y-4">
            <p className="text-sm">
              {plan.from_year.label} → <strong>{plan.to_year.label}</strong>:{" "}
              <strong>{plan.totals.promote}</strong> siswa naik kelas,{" "}
              <strong>{plan.totals.graduate}</strong> siswa lulus.
            </p>

            {plan.warnings.length > 0 && (
              <div className="bg-yellow-50 text-yellow-900 rounded-md p-3 text-sm space-y-1">
                {plan.warnings.map((w) => (
                  <div key={w} className="flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-1">Kelas yang dibuat</h3>
              <p className="text-sm text-secondary">
                {plan.classes_to_create.length === 0
                  ? "Semua kelas sudah ada."
                  : plan.classes_to_create.map((c) => c.name).join(", ")}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Naik kelas</h3>
              <ul className="text-sm space-y-0.5">
                {plan.promotions.map((p) => (
                  <li key={p.from_class_id}>
                    {p.from_class} → {p.to_class}: {p.students} siswa
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Lulus</h3>
              <ul className="text-sm space-y-0.5">
                {plan.graduations.map((g) => (
                  <li key={g.from_class_id}>
                    {g.from_class}: {g.students} siswa
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between">
              <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                Kembali
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setStep(4)}>
                Lanjut ke konfirmasi
              </button>
            </div>
          </div>
        )}

        {step === 4 && plan && (
          <div className="card p-6 space-y-4">
            <p className="text-sm">
              Anda akan menaikkan <strong>{plan.totals.promote}</strong> siswa dan
              meluluskan <strong>{plan.totals.graduate}</strong> siswa dari tahun
              ajaran {plan.from_year.label}. Riwayat presensi tetap tersimpan. Aksi
              ini dijalankan sekali dan aman bila terklik dua kali.
            </p>
            <div className="flex justify-between">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => setStep(3)}
              >
                Kembali
              </button>
              <button type="button" className="btn btn-primary" disabled={busy} onClick={run}>
                {busy ? "Memproses..." : "Jalankan transisi"}
              </button>
            </div>
          </div>
        )}

        {step === 5 && result && (
          <div className="card p-6 space-y-3">
            <div className="flex items-center text-green-700">
              <CheckCircle2 className="h-6 w-6 mr-2" />
              <h2 className="text-lg font-semibold">Transisi selesai</h2>
            </div>
            <ul className="text-sm space-y-1">
              <li>Kelas dibuat: {result.classes_created}</li>
              <li>Siswa naik kelas: {result.promoted}</li>
              <li>Siswa lulus: {result.graduated}</li>
              {result.skipped > 0 && <li>Dilewati: {result.skipped}</li>}
            </ul>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/atmin/presensi/students")}
            >
              Ke manajemen siswa
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default YearTransitionPage;
