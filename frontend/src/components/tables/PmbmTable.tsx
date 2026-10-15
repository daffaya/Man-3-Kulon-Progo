/**
 * @fileoverview PmbmTable — tabel pendaftar PMBM (mockup v3): nomor pendaftaran, nama, NISN,
 * jalur, asal sekolah, status, dan tombol detail.
 */
import React from "react";
import { Eye } from "lucide-react";
import type { PmbmRegistrationSummary } from "../../types/pmbmTypes";
import { JALUR_LABEL, STATUS_LABEL } from "../../types/pmbmTypes";
import { SkeletonRows } from "../admin/ListKit";

interface PmbmTableProps {
  registrations: PmbmRegistrationSummary[];
  onDetail: (registration: PmbmRegistrationSummary) => void;
  loading?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
}

const BADGE: Record<string, string> = {
  pending: "a-wn",
  verified: "a-in",
  accepted: "a-ok",
  rejected: "a-dg",
  withdrawn: "a-z",
};

const PmbmTable: React.FC<PmbmTableProps> = ({ registrations, onDetail, loading = false }) => (
  <div className="a-tw">
    <table className="a-tbl" style={{ minWidth: 800 }}>
      <thead>
        <tr>
          <th>No. pendaftaran</th>
          <th>Nama lengkap</th>
          <th>NISN</th>
          <th>Jalur</th>
          <th>Asal sekolah</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody aria-busy={loading}>
        {loading ? (
          <SkeletonRows cols={7} />
        ) : (
          registrations.map((r) => (
            <tr key={r.id}>
              <td>
                <button
                  type="button"
                  style={{ color: "var(--pri)", fontWeight: 700 }}
                  onClick={() => onDetail(r)}
                >
                  {r.nomor_pendaftaran}
                </button>
              </td>
              <td>{r.nama_lengkap}</td>
              <td>{r.nisn}</td>
              <td>{JALUR_LABEL[r.jalur] ?? r.jalur}</td>
              <td>{r.asal_sekolah}</td>
              <td>
                <span className={`a-b ${BADGE[r.status] ?? "a-z"}`}>
                  {STATUS_LABEL[r.status as keyof typeof STATUS_LABEL] ?? r.status}
                </span>
              </td>
              <td>
                <div className="a-acts" style={{ justifyContent: "flex-start" }}>
                  <button type="button" title="Lihat detail" aria-label={`Detail ${r.nama_lengkap}`} onClick={() => onDetail(r)}>
                    <Eye size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default PmbmTable;
