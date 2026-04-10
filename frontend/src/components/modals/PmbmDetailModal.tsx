/**
 * @fileoverview PmbmDetailModal component for viewing full registration details
 * and updating the registration status from the admin panel.
 */

import React, { useEffect, useState } from "react";
import { X, ExternalLink, Loader2 } from "lucide-react";
import type {
  PmbmRegistrationSummary,
  StatusPendaftaran,
} from "../../types/pmbmTypes";
import {
  JALUR_LABEL,
  KETERAMPILAN_LABEL,
  STATUS_LABEL,
} from "../../types/pmbmTypes";
import pmbmApi from "../../api/pmbmApi";
import { useToastMessage } from "../../hooks/useToastMessage";

/**
 * Props for the PmbmDetailModal component.
 */
interface PmbmDetailModalProps {
  /** The registration summary record used to fetch full detail. */
  registration: PmbmRegistrationSummary | null;
  /** Whether the modal is currently open. */
  isOpen: boolean;
  /** Callback fired when the modal should be closed. */
  onClose: () => void;
  /** Callback fired after a successful status update to refresh the table. */
  onStatusUpdated: () => void;
}

/**
 * A helper component that renders a label-value row inside the detail modal.
 */
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

/**
 * A helper component that renders a section heading inside the detail modal.
 */
const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
  <h4 className="text-xs font-semibold uppercase tracking-wide text-accent mt-5 mb-2">
    {title}
  </h4>
);

const STATUS_OPTIONS: { value: StatusPendaftaran; label: string }[] = [
  { value: "pending", label: "Menunggu Verifikasi" },
  { value: "verified", label: "Terverifikasi" },
  { value: "accepted", label: "Diterima" },
  { value: "rejected", label: "Ditolak" },
];

/**
 * Modal component for displaying the full detail of a PMBM registration record
 * and allowing an admin to update its status and add notes.
 *
 * @param {PmbmDetailModalProps} props - The component props.
 * @returns {JSX.Element | null} The rendered modal or null if not open.
 */
const PmbmDetailModal: React.FC<PmbmDetailModalProps> = ({
  registration,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<StatusPendaftaran>("pending");
  const [catatanAdmin, setCatatanAdmin] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isOpen || !registration) return;

    const fetchDetail = async () => {
      setLoadingDetail(true);
      setDetail(null);
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

  /**
   * Submits the status update and optional admin notes to the backend.
   */
  const handleUpdateStatus = async () => {
    if (!detail) return;
    setIsUpdating(true);
    try {
      await pmbmApi.updateStatus(detail.id, selectedStatus, catatanAdmin);
      showSuccessToast("Status pendaftaran berhasil diperbarui!");
      onStatusUpdated();
      onClose();
    } catch (error: any) {
      showErrorToast(error.message || "Gagal memperbarui status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !registration) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pmbm-detail-modal-title"
    >
      <div
        className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/10">
          <div>
            <h3
              id="pmbm-detail-modal-title"
              className="text-lg font-semibold text-foreground"
            >
              Detail Pendaftaran
            </h3>
            <p className="text-sm text-accent font-medium mt-0.5">
              {registration.nomor_pendaftaran}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-foreground p-1 rounded-full hover:bg-[rgb(var(--color-secondary-hover))] transition-colors"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loadingDetail ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={36} className="animate-spin text-accent" />
              <p className="mt-3 text-secondary text-sm">Memuat data...</p>
            </div>
          ) : detail ? (
            <>
              {/* Jalur & Gelombang */}
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

              {/* Data Siswa */}
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

              {/* Data Orang Tua */}
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

              {/* Kondisional */}
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

              {/* Dokumen */}
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
                      Buka Google Drive
                      <ExternalLink size={12} />
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

              {/* Update Status */}
              <SectionHeading title="Update Status" />
              <div className="space-y-3 mt-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Status Pendaftaran
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
                    rows={3}
                    placeholder="Tambahkan catatan untuk pendaftar ini..."
                    className="form-input w-full"
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        {!loadingDetail && detail && (
          <div className="flex justify-end gap-3 px-6 pb-6">
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
                  <Loader2 size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Status"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PmbmDetailModal;
