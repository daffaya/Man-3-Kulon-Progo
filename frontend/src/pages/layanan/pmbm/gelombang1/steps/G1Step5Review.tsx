import React from "react";
import PmbmReviewRow from "../../components/PmbmReviewRow";
import type { PmbmFormData } from "../../../../../types/pmbmTypes";
import {
  JALUR_LABEL,
  KETERAMPILAN_LABEL,
} from "../../../../../types/pmbmTypes";

const G1Step5Review: React.FC<{ form: PmbmFormData }> = ({ form }) => (
  <div className="space-y-6">
    <p className="text-sm text-secondary">
      Periksa kembali data yang kamu isi. Pastikan semua informasi sudah benar
      sebelum submit.
    </p>

    <div className="card p-5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-accent mb-3">
        Jalur
      </h4>
      <PmbmReviewRow
        label="Jalur Pendaftaran"
        value={JALUR_LABEL[form.jalur as keyof typeof JALUR_LABEL]}
      />
      {form.jalur === "keterampilan" && (
        <PmbmReviewRow
          label="Program Keterampilan"
          value={
            KETERAMPILAN_LABEL[
              form.pilihan_keterampilan as keyof typeof KETERAMPILAN_LABEL
            ]
          }
        />
      )}
    </div>

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
        value={form.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
      />
      <PmbmReviewRow label="Asal Sekolah" value={form.asal_sekolah} />
      <PmbmReviewRow label="No. KK" value={form.no_kk} />
      <PmbmReviewRow label="Alamat Lengkap" value={form.alamat_lengkap} />
      <PmbmReviewRow label="Alamat Domisili" value={form.alamat_domisili} />
      <PmbmReviewRow label="No. HP Siswa" value={form.no_hp_siswa} />
    </div>

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

    <div className="card p-5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-accent mb-3">
        Dokumen & Tambahan
      </h4>
      {form.jalur === "tahfidz" && (
        <PmbmReviewRow
          label="Hafalan"
          value={
            form.jumlah_hafalan_juz ? `${form.jumlah_hafalan_juz} Juz` : ""
          }
        />
      )}
      {form.jalur === "kko" && (
        <PmbmReviewRow label="Cabang Olahraga" value={form.cabang_olahraga} />
      )}
      {form.jalur === "akademik" && (
        <PmbmReviewRow
          label="Rata-rata Rapor"
          value={form.rata_rata_rapor ? String(form.rata_rata_rapor) : ""}
        />
      )}
      {form.nama_kejuaraan && (
        <PmbmReviewRow
          label="Kejuaraan"
          value={`${form.nama_kejuaraan} (${form.tingkat_kejuaraan}, ${form.tahun_kejuaraan})`}
        />
      )}
      <PmbmReviewRow
        label="Link Dokumen"
        value={form.link_dokumen || "Tidak dilampirkan"}
      />
      <PmbmReviewRow
        label="Komitmen"
        value={form.komitmen ? "✅ Bersedia" : "❌ Belum dicentang"}
      />
    </div>
  </div>
);

export default G1Step5Review;
