import React, { useEffect, useState } from "react";
import { X, ExternalLink, Loader2, Pencil } from "lucide-react";
import type {
  PmbmRegistrationSummary,
  StatusPendaftaran,
  JalurPendaftaran,
  PilihanKeterampilan,
} from "../../types/pmbmTypes";
import {
  JALUR_LABEL,
  KETERAMPILAN_LABEL,
  STATUS_LABEL,
} from "../../types/pmbmTypes";
import pmbmApi from "../../api/pmbmApi";
import { useToastMessage } from "../../hooks/useToastMessage";

/* ─── Types ──────────────────────────────────────── */
interface PmbmDetailModalProps {
  registration: PmbmRegistrationSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

type ModalMode = "view" | "edit";
type EditTab = "jalur" | "siswa" | "ortu" | "tambahan";

/* ─── Constants ──────────────────────────────────── */
const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, label]) => ({
  value: value as StatusPendaftaran,
  label,
}));

const JALUR_OPTIONS = Object.entries(JALUR_LABEL).map(([value, label]) => ({
  value: value as JalurPendaftaran,
  label,
}));

const KETERAMPILAN_OPTIONS = Object.entries(KETERAMPILAN_LABEL).map(
  ([value, label]) => ({
    value: value as PilihanKeterampilan,
    label,
  }),
);

const PENGHASILAN_OPTIONS = [
  "< Rp 500.000",
  "Rp 500.000 – Rp 1.000.000",
  "Rp 1.000.000 – Rp 2.000.000",
  "Rp 2.000.000 – Rp 3.500.000",
  "Rp 3.500.000 – Rp 5.000.000",
  "> Rp 5.000.000",
];

const EDIT_TABS: { key: EditTab; label: string }[] = [
  { key: "jalur", label: "Jalur" },
  { key: "siswa", label: "Data Siswa" },
  { key: "ortu", label: "Data Ortu" },
  { key: "tambahan", label: "Tambahan & Dokumen" },
];

/* ─── Styling helpers ────────────────────────────── */
const inp = "form-input w-full text-sm";
const inp_err = "form-input w-full text-sm border-[rgb(var(--color-error))]";

/* ─── Sub-components ─────────────────────────────── */
const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-secondary/10 last:border-0">
    <span className="text-xs text-secondary sm:w-44 flex-shrink-0">
      {label}
    </span>
    <span className="text-sm text-foreground font-medium">
      {value || <span className="text-secondary italic">—</span>}
    </span>
  </div>
);

const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
  <h4 className="text-xs font-semibold uppercase tracking-wide text-accent mt-5 mb-2 first:mt-0">
    {title}
  </h4>
);

/* ─── Main Component ─────────────────────────────── */
const PmbmDetailModal: React.FC<PmbmDetailModalProps> = ({
  registration,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const { showSuccessToast, showErrorToast } = useToastMessage();

  // Data state
  const [detail, setDetail] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);

  // UI state
  const [mode, setMode] = useState<ModalMode>("view");
  const [activeTab, setActiveTab] = useState<EditTab>("jalur");
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Loading state
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSavingData, setIsSavingData] = useState(false);

  // Validation
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Status update
  const [selectedStatus, setSelectedStatus] =
    useState<StatusPendaftaran>("pending");
  const [catatanAdmin, setCatatanAdmin] = useState("");

  /* ── Fetch detail on open ── */
  useEffect(() => {
    if (!isOpen || !registration) return;
    const fetchDetail = async () => {
      setLoadingDetail(true);
      setDetail(null);
      setMode("view");
      setShowExitConfirm(false);
      try {
        const data = await pmbmApi.getById(registration.id);
        setDetail(data);
        setSelectedStatus(data.status);
        setCatatanAdmin(data.catatan_admin ?? "");
      } catch (error: any) {
        showErrorToast(error.message || "Gagal memuat detail pendaftar");
        onClose();
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [isOpen, registration]);

  /* ── Enter edit mode ── */
  const handleEnterEdit = () => {
    setEditForm({ ...detail });
    setEditErrors({});
    setActiveTab("jalur");
    setShowExitConfirm(false);
    setMode("edit");
  };

  /* ── Attempt close — show confirm if in edit mode ── */
  const handleAttemptClose = () => {
    if (mode === "edit") {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  /* ── Confirm exit from edit mode ── */
  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    setEditForm(null);
    setEditErrors({});
    setMode("view");
  };

  /* ── Generic field change ── */
  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setEditForm((f: any) => ({
      ...f,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error on change
    if (editErrors[name]) {
      setEditErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  /* ── Validate per tab ── */
  const validateTab = (tab: EditTab): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (tab === "jalur") {
      if (!editForm.jalur) errs.jalur = "Wajib dipilih";
      if (editForm.jalur === "keterampilan" && !editForm.pilihan_keterampilan)
        errs.pilihan_keterampilan = "Wajib dipilih";
    }

    if (tab === "siswa") {
      if (!editForm.nama_lengkap) errs.nama_lengkap = "Wajib diisi";
      if (!editForm.nisn) errs.nisn = "Wajib diisi";
      else if (!/^\d{10}$/.test(editForm.nisn)) errs.nisn = "Harus 10 digit";
      if (!editForm.nik) errs.nik = "Wajib diisi";
      else if (!/^\d{16}$/.test(editForm.nik)) errs.nik = "Harus 16 digit";
      if (!editForm.tempat_lahir) errs.tempat_lahir = "Wajib diisi";
      if (!editForm.tanggal_lahir) errs.tanggal_lahir = "Wajib diisi";
      if (!editForm.jenis_kelamin) errs.jenis_kelamin = "Wajib dipilih";
      if (!editForm.asal_sekolah) errs.asal_sekolah = "Wajib diisi";
      if (!editForm.no_kk) errs.no_kk = "Wajib diisi";
      if (!editForm.alamat_lengkap) errs.alamat_lengkap = "Wajib diisi";
      if (!editForm.alamat_domisili) errs.alamat_domisili = "Wajib diisi";
      if (!editForm.no_hp_siswa) errs.no_hp_siswa = "Wajib diisi";
    }

    if (tab === "ortu") {
      if (!editForm.nama_ayah) errs.nama_ayah = "Wajib diisi";
      if (!editForm.nama_ibu) errs.nama_ibu = "Wajib diisi";
    }

    if (tab === "tambahan") {
      if (editForm.jalur === "tahfidz" && !editForm.jumlah_hafalan_juz)
        errs.jumlah_hafalan_juz = "Wajib diisi";
      if (editForm.jalur === "kko" && !editForm.cabang_olahraga)
        errs.cabang_olahraga = "Wajib diisi";
      if (editForm.jalur === "akademik" && !editForm.rata_rata_rapor)
        errs.rata_rata_rapor = "Wajib diisi";
    }

    return errs;
  };

  /* ── Validate all tabs before save ── */
  const validateAll = (): boolean => {
    const allErrs = {
      ...validateTab("jalur"),
      ...validateTab("siswa"),
      ...validateTab("ortu"),
      ...validateTab("tambahan"),
    };
    setEditErrors(allErrs);
    if (Object.keys(allErrs).length > 0) {
      // Auto-navigate to first tab with error
      const tabOrder: EditTab[] = ["jalur", "siswa", "ortu", "tambahan"];
      for (const tab of tabOrder) {
        const tabErrs = validateTab(tab);
        if (Object.keys(tabErrs).length > 0) {
          setActiveTab(tab);
          break;
        }
      }
      return false;
    }
    return true;
  };

  /* ── Save edited data ── */
  const handleSaveData = async () => {
    if (!validateAll()) return;
    setIsSavingData(true);
    try {
      await pmbmApi.updateData(detail.id, editForm);
      showSuccessToast("Data pendaftaran berhasil diperbarui!");
      const updated = await pmbmApi.getById(detail.id);
      setDetail(updated);
      setSelectedStatus(updated.status);
      setCatatanAdmin(updated.catatan_admin ?? "");
      setMode("view");
      onStatusUpdated();
    } catch (error: any) {
      showErrorToast(error.message || "Gagal memperbarui data");
    } finally {
      setIsSavingData(false);
    }
  };

  /* ── Save status ── */
  const handleUpdateStatus = async () => {
    if (!detail) return;
    setIsUpdating(true);
    try {
      await pmbmApi.updateStatus(detail.id, selectedStatus, catatanAdmin);
      showSuccessToast("Status berhasil diperbarui!");
      onStatusUpdated();
      onClose();
    } catch (error: any) {
      showErrorToast(error.message || "Gagal memperbarui status");
    } finally {
      setIsUpdating(false);
    }
  };

  /* ── Tab error indicator ── */
  const tabHasError = (tab: EditTab): boolean => {
    if (!editErrors || Object.keys(editErrors).length === 0) return false;
    return Object.keys(validateTab(tab)).some((key) => editErrors[key]);
  };

  if (!isOpen || !registration) return null;

  /* ── Helper components (defined here to access editForm/errors) ── */
  const ErrMsg = ({ field }: { field: string }) =>
    editErrors[field] ? (
      <p className="text-[rgb(var(--color-error))] text-xs mt-1">
        {editErrors[field]}
      </p>
    ) : null;

  const EditField = ({
    label,
    field,
    children,
  }: {
    label: string;
    field: string;
    children: React.ReactNode;
  }) => (
    <div>
      <label className="block text-xs text-secondary mb-1">{label}</label>
      {children}
      <ErrMsg field={field} />
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleAttemptClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="Detail Modal Title"
    >
      <div
        className="card w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ══ Header ══ */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary/10 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {mode === "edit" ? "Edit Data Pendaftaran" : "Detail Pendaftaran"}
            </h3>
            <p className="text-sm text-accent font-medium mt-0.5">
              {registration.nomor_pendaftaran}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!loadingDetail && detail && mode === "view" && (
              <button
                onClick={handleEnterEdit}
                className="btn btn-secondary flex items-center gap-1.5 text-sm"
              >
                <Pencil size={14} />
                Edit Data
              </button>
            )}
            <button
              onClick={handleAttemptClose}
              className="text-secondary hover:text-foreground p-1 rounded-full hover:bg-[rgb(var(--color-secondary-hover))] transition-colors"
              aria-label="Tutup modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ══ Exit confirm banner ══ */}
        {showExitConfirm && (
          <div className="mx-6 mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
            <p className="text-sm text-foreground">
              ⚠️ Perubahan belum disimpan. Yakin ingin keluar dari mode edit?
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="btn btn-secondary text-xs px-3 py-1.5"
              >
                Lanjut Edit
              </button>
              <button
                onClick={handleConfirmExit}
                className="btn text-xs px-3 py-1.5 bg-[rgb(var(--color-error))]/10 text-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-error))]/20 border border-[rgb(var(--color-error))]/30 rounded-lg"
              >
                Keluar
              </button>
            </div>
          </div>
        )}

        {/* ══ Edit mode tabs ══ */}
        {mode === "edit" && !loadingDetail && (
          <div className="flex border-b border-secondary/10 flex-shrink-0 px-6 overflow-x-auto">
            {EDIT_TABS.map((tab) => {
              const hasErr = tabHasError(tab.key);
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px
                    ${
                      activeTab === tab.key
                        ? "border-accent text-accent"
                        : "border-transparent text-secondary hover:text-foreground"
                    }`}
                >
                  {tab.label}
                  {hasErr && (
                    <span className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-[rgb(var(--color-error))] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ══ Body (scrollable) ══ */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loadingDetail ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={36} className="animate-spin text-accent" />
              <p className="mt-3 text-secondary text-sm">Memuat data...</p>
            </div>
          ) : detail && mode === "view" ? (
            /* ════ VIEW MODE ════ */
            <>
              {/* Status update — di atas */}
              <SectionHeading title="Status Pendaftaran" />
              <div className="space-y-3 mb-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as StatusPendaftaran)
                    }
                    className="form-input w-full"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Catatan Admin{" "}
                    <span className="text-secondary font-normal">
                      (opsional)
                    </span>
                  </label>
                  <textarea
                    value={catatanAdmin}
                    onChange={(e) => setCatatanAdmin(e.target.value)}
                    rows={2}
                    placeholder="Tambahkan catatan untuk pendaftar ini..."
                    className="form-input w-full"
                  />
                </div>
              </div>

              {/* Data detail */}
              <SectionHeading title="Jalur Pendaftaran" />
              <DetailRow
                label="Gelombang"
                value={`Gelombang ${detail.gelombang}`}
              />
              <DetailRow
                label="Jalur"
                value={JALUR_LABEL[detail.jalur as keyof typeof JALUR_LABEL]}
              />
              {detail.pilihan_keterampilan && (
                <DetailRow
                  label="Program Keterampilan"
                  value={
                    KETERAMPILAN_LABEL[
                      detail.pilihan_keterampilan as keyof typeof KETERAMPILAN_LABEL
                    ]
                  }
                />
              )}

              <SectionHeading title="Data Siswa" />
              <DetailRow label="Nama Lengkap" value={detail.nama_lengkap} />
              <DetailRow label="NISN" value={detail.nisn} />
              <DetailRow label="NIK" value={detail.nik} />
              <DetailRow label="Tempat Lahir" value={detail.tempat_lahir} />
              <DetailRow
                label="Tanggal Lahir"
                value={
                  detail.tanggal_lahir
                    ? new Date(detail.tanggal_lahir).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : null
                }
              />
              <DetailRow
                label="Jenis Kelamin"
                value={detail.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
              />
              <DetailRow label="Asal Sekolah" value={detail.asal_sekolah} />
              <DetailRow label="No. KK" value={detail.no_kk} />
              <DetailRow label="Alamat Lengkap" value={detail.alamat_lengkap} />
              <DetailRow
                label="Alamat Domisili"
                value={detail.alamat_domisili}
              />
              <DetailRow label="No. HP Siswa" value={detail.no_hp_siswa} />

              <SectionHeading title="Data Orang Tua" />
              <DetailRow label="Nama Ayah" value={detail.nama_ayah} />
              <DetailRow label="Nama Ibu" value={detail.nama_ibu} />
              <DetailRow label="Pekerjaan Ayah" value={detail.pekerjaan_ayah} />
              <DetailRow label="Pekerjaan Ibu" value={detail.pekerjaan_ibu} />
              <DetailRow
                label="Penghasilan Ayah"
                value={detail.penghasilan_ayah}
              />
              <DetailRow
                label="Penghasilan Ibu"
                value={detail.penghasilan_ibu}
              />
              <DetailRow label="Alamat Orang Tua" value={detail.alamat_ortu} />
              <DetailRow
                label="Domisili Orang Tua"
                value={detail.alamat_domisili_ortu}
              />
              <DetailRow label="No. HP Ayah" value={detail.no_hp_ayah} />
              <DetailRow label="No. HP Ibu" value={detail.no_hp_ibu} />

              {(detail.jumlah_hafalan_juz ||
                detail.cabang_olahraga ||
                detail.rata_rata_rapor ||
                detail.nama_kejuaraan) && (
                <>
                  <SectionHeading title="Data Tambahan" />
                  {detail.jumlah_hafalan_juz && (
                    <DetailRow
                      label="Hafalan"
                      value={`${detail.jumlah_hafalan_juz} Juz`}
                    />
                  )}
                  {detail.cabang_olahraga && (
                    <DetailRow
                      label="Cabang Olahraga"
                      value={detail.cabang_olahraga}
                    />
                  )}
                  {detail.rata_rata_rapor && (
                    <DetailRow
                      label="Rata-rata Rapor"
                      value={detail.rata_rata_rapor}
                    />
                  )}
                  {detail.nama_kejuaraan && (
                    <DetailRow
                      label="Kejuaraan"
                      value={`${detail.nama_kejuaraan} (${detail.tingkat_kejuaraan}, ${detail.tahun_kejuaraan})`}
                    />
                  )}
                </>
              )}

              <SectionHeading title="Dokumen" />
              <DetailRow
                label="Link Dokumen"
                value={
                  detail.link_dokumen ? (
                    <a
                      href={detail.link_dokumen}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline flex items-center gap-1"
                    >
                      Buka Google Drive <ExternalLink size={12} />
                    </a>
                  ) : (
                    "Tidak dilampirkan"
                  )
                }
              />
              <DetailRow
                label="Komitmen"
                value={detail.komitmen ? "✅ Bersedia" : "❌ Tidak"}
              />
            </>
          ) : detail && mode === "edit" ? (
            /* ════ EDIT MODE ════ */
            <div className="space-y-4">
              {/* ── Tab: Jalur ── */}
              {activeTab === "jalur" && (
                <div className="space-y-4">
                  <EditField label="Jalur Pendaftaran *" field="jalur">
                    <select
                      name="jalur"
                      value={editForm.jalur}
                      onChange={handleEditChange}
                      className={editErrors.jalur ? inp_err : inp}
                    >
                      {JALUR_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </EditField>

                  {editForm.jalur === "keterampilan" && (
                    <EditField
                      label="Program Keterampilan *"
                      field="pilihan_keterampilan"
                    >
                      <select
                        name="pilihan_keterampilan"
                        value={editForm.pilihan_keterampilan ?? ""}
                        onChange={handleEditChange}
                        className={
                          editErrors.pilihan_keterampilan ? inp_err : inp
                        }
                      >
                        <option value="">-- Pilih --</option>
                        {KETERAMPILAN_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </EditField>
                  )}
                </div>
              )}

              {/* ── Tab: Data Siswa ── */}
              {activeTab === "siswa" && (
                <div className="space-y-3">
                  <EditField label="Nama Lengkap *" field="nama_lengkap">
                    <input
                      name="nama_lengkap"
                      value={editForm.nama_lengkap}
                      onChange={handleEditChange}
                      className={editErrors.nama_lengkap ? inp_err : inp}
                    />
                  </EditField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <EditField label="NISN *" field="nisn">
                      <input
                        name="nisn"
                        value={editForm.nisn}
                        onChange={handleEditChange}
                        maxLength={10}
                        placeholder="10 digit"
                        className={editErrors.nisn ? inp_err : inp}
                      />
                    </EditField>
                    <EditField label="NIK *" field="nik">
                      <input
                        name="nik"
                        value={editForm.nik}
                        onChange={handleEditChange}
                        maxLength={16}
                        placeholder="16 digit"
                        className={editErrors.nik ? inp_err : inp}
                      />
                    </EditField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <EditField label="Tempat Lahir *" field="tempat_lahir">
                      <input
                        name="tempat_lahir"
                        value={editForm.tempat_lahir}
                        onChange={handleEditChange}
                        className={editErrors.tempat_lahir ? inp_err : inp}
                      />
                    </EditField>
                    <EditField label="Tanggal Lahir *" field="tanggal_lahir">
                      <input
                        type="date"
                        name="tanggal_lahir"
                        value={editForm.tanggal_lahir?.split("T")[0] ?? ""}
                        onChange={handleEditChange}
                        className={editErrors.tanggal_lahir ? inp_err : inp}
                      />
                    </EditField>
                  </div>

                  <EditField label="Jenis Kelamin *" field="jenis_kelamin">
                    <select
                      name="jenis_kelamin"
                      value={editForm.jenis_kelamin}
                      onChange={handleEditChange}
                      className={editErrors.jenis_kelamin ? inp_err : inp}
                    >
                      <option value="">Pilih</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </EditField>

                  <EditField label="Asal Sekolah *" field="asal_sekolah">
                    <input
                      name="asal_sekolah"
                      value={editForm.asal_sekolah}
                      onChange={handleEditChange}
                      className={editErrors.asal_sekolah ? inp_err : inp}
                    />
                  </EditField>

                  <EditField label="No. KK *" field="no_kk">
                    <input
                      name="no_kk"
                      value={editForm.no_kk}
                      onChange={handleEditChange}
                      maxLength={16}
                      className={editErrors.no_kk ? inp_err : inp}
                    />
                  </EditField>

                  <EditField label="Alamat Lengkap *" field="alamat_lengkap">
                    <textarea
                      name="alamat_lengkap"
                      value={editForm.alamat_lengkap}
                      onChange={handleEditChange}
                      rows={2}
                      className={editErrors.alamat_lengkap ? inp_err : inp}
                    />
                  </EditField>

                  <EditField label="Alamat Domisili *" field="alamat_domisili">
                    <textarea
                      name="alamat_domisili"
                      value={editForm.alamat_domisili}
                      onChange={handleEditChange}
                      rows={2}
                      className={editErrors.alamat_domisili ? inp_err : inp}
                    />
                  </EditField>

                  <EditField label="No. HP Siswa *" field="no_hp_siswa">
                    <input
                      type="tel"
                      name="no_hp_siswa"
                      value={editForm.no_hp_siswa}
                      onChange={handleEditChange}
                      className={editErrors.no_hp_siswa ? inp_err : inp}
                    />
                  </EditField>
                </div>
              )}

              {/* ── Tab: Data Ortu ── */}
              {activeTab === "ortu" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <EditField label="Nama Ayah *" field="nama_ayah">
                      <input
                        name="nama_ayah"
                        value={editForm.nama_ayah}
                        onChange={handleEditChange}
                        className={editErrors.nama_ayah ? inp_err : inp}
                      />
                    </EditField>
                    <EditField label="Nama Ibu *" field="nama_ibu">
                      <input
                        name="nama_ibu"
                        value={editForm.nama_ibu}
                        onChange={handleEditChange}
                        className={editErrors.nama_ibu ? inp_err : inp}
                      />
                    </EditField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <EditField label="Pekerjaan Ayah" field="pekerjaan_ayah">
                      <input
                        name="pekerjaan_ayah"
                        value={editForm.pekerjaan_ayah ?? ""}
                        onChange={handleEditChange}
                        className={inp}
                      />
                    </EditField>
                    <EditField label="Pekerjaan Ibu" field="pekerjaan_ibu">
                      <input
                        name="pekerjaan_ibu"
                        value={editForm.pekerjaan_ibu ?? ""}
                        onChange={handleEditChange}
                        className={inp}
                      />
                    </EditField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <EditField
                      label="Penghasilan Ayah"
                      field="penghasilan_ayah"
                    >
                      <select
                        name="penghasilan_ayah"
                        value={editForm.penghasilan_ayah ?? ""}
                        onChange={handleEditChange}
                        className={inp}
                      >
                        <option value="">Pilih</option>
                        {PENGHASILAN_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </EditField>
                    <EditField label="Penghasilan Ibu" field="penghasilan_ibu">
                      <select
                        name="penghasilan_ibu"
                        value={editForm.penghasilan_ibu ?? ""}
                        onChange={handleEditChange}
                        className={inp}
                      >
                        <option value="">Pilih</option>
                        {PENGHASILAN_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </EditField>
                  </div>

                  <EditField label="Alamat Orang Tua" field="alamat_ortu">
                    <textarea
                      name="alamat_ortu"
                      value={editForm.alamat_ortu ?? ""}
                      onChange={handleEditChange}
                      rows={2}
                      className={inp}
                    />
                  </EditField>

                  <EditField
                    label="Alamat Domisili Orang Tua"
                    field="alamat_domisili_ortu"
                  >
                    <textarea
                      name="alamat_domisili_ortu"
                      value={editForm.alamat_domisili_ortu ?? ""}
                      onChange={handleEditChange}
                      rows={2}
                      className={inp}
                    />
                  </EditField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <EditField label="No. HP Ayah" field="no_hp_ayah">
                      <input
                        type="tel"
                        name="no_hp_ayah"
                        value={editForm.no_hp_ayah ?? ""}
                        onChange={handleEditChange}
                        className={inp}
                      />
                    </EditField>
                    <EditField label="No. HP Ibu" field="no_hp_ibu">
                      <input
                        type="tel"
                        name="no_hp_ibu"
                        value={editForm.no_hp_ibu ?? ""}
                        onChange={handleEditChange}
                        className={inp}
                      />
                    </EditField>
                  </div>
                </div>
              )}

              {/* ── Tab: Tambahan & Dokumen ── */}
              {activeTab === "tambahan" && (
                <div className="space-y-4">
                  {editForm.jalur === "tahfidz" && (
                    <EditField
                      label="Jumlah Hafalan (Juz) *"
                      field="jumlah_hafalan_juz"
                    >
                      <input
                        type="number"
                        name="jumlah_hafalan_juz"
                        value={editForm.jumlah_hafalan_juz ?? ""}
                        onChange={handleEditChange}
                        min={1}
                        max={30}
                        className={
                          editErrors.jumlah_hafalan_juz ? inp_err : inp
                        }
                      />
                    </EditField>
                  )}

                  {editForm.jalur === "kko" && (
                    <EditField
                      label="Cabang Olahraga *"
                      field="cabang_olahraga"
                    >
                      <input
                        name="cabang_olahraga"
                        value={editForm.cabang_olahraga ?? ""}
                        onChange={handleEditChange}
                        className={editErrors.cabang_olahraga ? inp_err : inp}
                      />
                    </EditField>
                  )}

                  {editForm.jalur === "akademik" && (
                    <EditField
                      label="Rata-rata Rapor *"
                      field="rata_rata_rapor"
                    >
                      <input
                        type="number"
                        name="rata_rata_rapor"
                        value={editForm.rata_rata_rapor ?? ""}
                        onChange={handleEditChange}
                        min={0}
                        max={100}
                        step={0.01}
                        className={editErrors.rata_rata_rapor ? inp_err : inp}
                      />
                    </EditField>
                  )}

                  <div className="border-t border-secondary/10 pt-4">
                    <p className="text-xs text-secondary mb-3 font-medium uppercase tracking-wide">
                      Sertifikat / Kejuaraan
                    </p>
                    <div className="space-y-3">
                      <EditField
                        label="Jenis Kejuaraan"
                        field="jenis_kejuaraan"
                      >
                        <input
                          name="jenis_kejuaraan"
                          value={editForm.jenis_kejuaraan ?? ""}
                          onChange={handleEditChange}
                          placeholder="Contoh: Olahraga, Akademik"
                          className={inp}
                        />
                      </EditField>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <EditField
                          label="Tingkat Kejuaraan"
                          field="tingkat_kejuaraan"
                        >
                          <select
                            name="tingkat_kejuaraan"
                            value={editForm.tingkat_kejuaraan ?? ""}
                            onChange={handleEditChange}
                            className={inp}
                          >
                            <option value="">Pilih</option>
                            <option value="kecamatan">Kecamatan</option>
                            <option value="kabupaten">Kabupaten / Kota</option>
                            <option value="provinsi">Provinsi</option>
                            <option value="nasional">Nasional</option>
                          </select>
                        </EditField>
                        <EditField
                          label="Tahun Kejuaraan"
                          field="tahun_kejuaraan"
                        >
                          <input
                            type="number"
                            name="tahun_kejuaraan"
                            value={editForm.tahun_kejuaraan ?? ""}
                            onChange={handleEditChange}
                            min={2020}
                            max={2026}
                            placeholder="Contoh: 2025"
                            className={inp}
                          />
                        </EditField>
                      </div>

                      <EditField label="Nama Kejuaraan" field="nama_kejuaraan">
                        <input
                          name="nama_kejuaraan"
                          value={editForm.nama_kejuaraan ?? ""}
                          onChange={handleEditChange}
                          placeholder="Contoh: Olimpiade Sains Kabupaten"
                          className={inp}
                        />
                      </EditField>
                    </div>
                  </div>

                  <div className="border-t border-secondary/10 pt-4 space-y-3">
                    <p className="text-xs text-secondary font-medium uppercase tracking-wide">
                      Dokumen & Komitmen
                    </p>
                    <EditField label="Link Google Drive" field="link_dokumen">
                      <input
                        type="url"
                        name="link_dokumen"
                        value={editForm.link_dokumen ?? ""}
                        onChange={handleEditChange}
                        placeholder="https://drive.google.com/..."
                        className={inp}
                      />
                    </EditField>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="komitmen"
                        checked={!!editForm.komitmen}
                        onChange={handleEditChange}
                        className="w-4 h-4 accent-accent"
                      />
                      <span className="text-sm text-foreground">
                        Komitmen mendaftar di MAN 3 Kulon Progo
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* ══ Footer ══ */}
        {!loadingDetail && detail && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-secondary/10 flex-shrink-0">
            {mode === "view" ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="btn btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />{" "}
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Status"
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAttemptClose}
                  className="btn btn-secondary"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveData}
                  disabled={isSavingData}
                  className="btn btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingData ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />{" "}
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Data"
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PmbmDetailModal;
