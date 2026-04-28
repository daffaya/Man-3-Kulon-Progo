/**
 * @fileoverview Step 4 (Review) component for G2 registration form.
 * Displays a summary of all user input before final submission.
 */

import React from "react";
import PmbmReviewRow from "../../components/PmbmReviewRow";
import type { G2FormData } from "../gelombang2Types";
import { KETERAMPILAN_LABEL } from "../../../../../types/pmbmTypes";
import type { PilihanKeterampilan } from "../../../../../types/pmbmTypes";

/**
 * Step 4 review section.
 */
const G2Step4Review: React.FC<{ form: G2FormData }> = ({ form }) => (
  <div className="space-y-6">
    <p className="text-sm text-secondary">
      Periksa kembali data sebelum submit.
    </p>

    {/* Data Siswa */}
    <div className="card p-5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-accent mb-3">
        Data Siswa
      </h4>
      <PmbmReviewRow label="Nama Lengkap" value={form.nama_lengkap} />
      <PmbmReviewRow label="NISN" value={form.nisn} />
      <PmbmReviewRow label="NIK" value={form.nik} />
      <PmbmReviewRow label="Tempat Lahir" value={form.tempat_lahir} />
      <PmbmReviewRow label="Tanggal Lahir" value={form.tanggal_lahir} />
      <PmbmReviewRow
        label="Jenis Kelamin"
        value={
          form.jenis_kelamin === "L"
            ? "Laki-laki"
            : form.jenis_kelamin === "P"
              ? "Perempuan"
              : "-"
        }
      />
      <PmbmReviewRow label="Asal Sekolah" value={form.asal_sekolah} />
      <PmbmReviewRow label="No. KK" value={form.no_kk} />
      <PmbmReviewRow label="Alamat Lengkap" value={form.alamat_lengkap} />
      <PmbmReviewRow label="Alamat Domisili" value={form.alamat_domisili} />
      <PmbmReviewRow label="No. HP Siswa" value={form.no_hp_siswa} />
    </div>

    {/* Data Ortu */}
    <div className="card p-5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-accent mb-3">
        Data Orang Tua
      </h4>
      <PmbmReviewRow label="Nama Ayah" value={form.nama_ayah} />
      <PmbmReviewRow label="Nama Ibu" value={form.nama_ibu} />
      <PmbmReviewRow label="Pekerjaan Ayah" value={form.pekerjaan_ayah} />
      <PmbmReviewRow label="Pekerjaan Ibu" value={form.pekerjaan_ibu} />
      <PmbmReviewRow label="Penghasilan Ayah" value={form.penghasilan_ayah} />
      <PmbmReviewRow label="Penghasilan Ibu" value={form.penghasilan_ibu} />
      <PmbmReviewRow label="Alamat Orang Tua" value={form.alamat_ortu} />
      <PmbmReviewRow
        label="Domisili Orang Tua"
        value={form.alamat_domisili_ortu}
      />
      <PmbmReviewRow label="No. HP Ayah" value={form.no_hp_ayah} />
      <PmbmReviewRow label="No. HP Ibu" value={form.no_hp_ibu} />
    </div>

    {/* Dokumen & Minat */}
    <div className="card p-5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-accent mb-3">
        Dokumen & Minat
      </h4>

      <PmbmReviewRow
        label="Nilai TKA Literasi"
        value={form.nilai_tka_literasi ? `${form.nilai_tka_literasi}` : "—"}
      />
      <PmbmReviewRow
        label="Nilai TKA Numerasi"
        value={form.nilai_tka_numerasi ? `${form.nilai_tka_numerasi}` : "—"}
      />

      <PmbmReviewRow
        label="Minat Keterampilan"
        value={
          form.pilihan_keterampilan
            ? KETERAMPILAN_LABEL[
                form.pilihan_keterampilan as PilihanKeterampilan
              ]
            : "-"
        }
      />
      <PmbmReviewRow label="Link Dokumen" value={form.link_dokumen || "-"} />
      <PmbmReviewRow
        label="Komitmen"
        value={form.komitmen ? "Bersedia" : "Belum dicentang"}
      />
    </div>
  </div>
);

export default G2Step4Review;
