/**
 * @fileoverview ArchiveAdminTable — tabel arsip untuk admin (mockup v3). Tabel arsip publik
 * (ArchiveTable) tidak diubah.
 */
import React from "react";
import { Download, FileText, SquarePen, Trash2 } from "lucide-react";
import type { Archive } from "../../types/archiveTypes";
import { SkeletonRows } from "../admin/ListKit";
import { shortDate } from "../../hooks/useAdminSummary";

interface Props {
  archives: Archive[];
  loading: boolean;
  onDownload: (id: number, fileName: string) => void;
  onEdit: (archive: Archive) => void;
  onDelete: (id: number) => void;
}

const ArchiveAdminTable: React.FC<Props> = ({ archives, loading, onDownload, onEdit, onDelete }) => (
  <div className="a-tw">
    <table className="a-tbl" style={{ minWidth: 760 }}>
      <thead>
        <tr>
          <th>Nama file</th>
          <th>Kategori</th>
          <th>Deskripsi</th>
          <th>Nomor dokumen</th>
          <th>Tanggal</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody aria-busy={loading}>
        {loading ? (
          <SkeletonRows cols={6} />
        ) : (
          archives.map((a) => (
            <tr key={a.id}>
              <td>
                <div className="a-tt" style={{ minWidth: 0 }}>
                  <span className="a-th"><FileText size={18} /></span>
                  <b>{a.file_name}</b>
                </div>
              </td>
              <td>{a.category_name || "-"}</td>
              <td>{a.description || "-"}</td>
              <td>{a.document_number || "-"}</td>
              <td>{shortDate(a.document_date)}</td>
              <td>
                <div className="a-acts">
                  <button type="button" title="Unduh" aria-label={`Unduh ${a.file_name}`} onClick={() => onDownload(a.id, a.file_name)}>
                    <Download size={18} />
                  </button>
                  <button type="button" title="Sunting" aria-label={`Sunting ${a.file_name}`} onClick={() => onEdit(a)}>
                    <SquarePen size={18} />
                  </button>
                  <button type="button" className="a-x" title="Hapus" aria-label={`Hapus ${a.file_name}`} onClick={() => onDelete(a.id)}>
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

export default ArchiveAdminTable;
