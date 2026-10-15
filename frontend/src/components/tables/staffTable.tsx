/**
 * @fileoverview StaffTable — tabel guru & staf (mockup v3): avatar inisial + nama, NIP, tipe,
 * jenis kelamin, status kepegawaian, jabatan, dan aksi sunting/hapus.
 */
import React from "react";
import { Link } from "react-router-dom";
import { SquarePen, Trash2 } from "lucide-react";
import type { Staff } from "../../types/staffTypes";
import { SkeletonRows, initials } from "../admin/ListKit";

interface StaffTableProps {
  staff: Staff[];
  onDelete: (id: number) => void;
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
}

const StaffTable: React.FC<StaffTableProps> = ({ staff, onDelete, loading }) => (
  <div className="a-tw">
    <table className="a-tbl" style={{ minWidth: 760 }}>
      <thead>
        <tr>
          <th>Nama</th>
          <th>NIP</th>
          <th>Tipe</th>
          <th>Jenis kelamin</th>
          <th>Status</th>
          <th>Jabatan</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody aria-busy={loading}>
        {loading ? (
          <SkeletonRows cols={7} />
        ) : (
          staff.map((s) => (
            <tr key={s.id}>
              <td>
                <div className="a-tt" style={{ minWidth: 0 }}>
                  <span className="a-av">{initials(s.nama)}</span>
                  <b>{s.nama}</b>
                </div>
              </td>
              <td>{s.nip}</td>
              <td>
                <span className={`a-b ${s.type === "teacher" ? "a-in" : "a-ok"}`}>
                  {s.type === "teacher" ? "Guru" : "Staf"}
                </span>
              </td>
              <td>{s.gender === "L" ? "Laki-laki" : "Perempuan"}</td>
              <td>{s.status}</td>
              <td>{s.jabatan}</td>
              <td>
                <div className="a-acts">
                  <Link to={`/atmin/staff/${s.id}/edit`} title="Sunting" aria-label={`Sunting ${s.nama}`}>
                    <SquarePen size={18} />
                  </Link>
                  <button type="button" className="a-x" title="Hapus" aria-label={`Hapus ${s.nama}`} onClick={() => onDelete(s.id)}>
                    <Trash2 size={18} />
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

export default StaffTable;
