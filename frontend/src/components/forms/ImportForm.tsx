/**
 * @fileoverview Student import form: pick the academic year and an Excel file,
 * review a per-row preview (new / unchanged / changed / moved / error), choose
 * what to do with changed and moved rows, then commit. Nothing is written
 * until the admin confirms.
 */

import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Download, Upload } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useImportStudent } from "../../hooks/useImportStudent";
import { AcademicYear, fetchAcademicYears } from "../../api/academicYearApi";
import {
  ImportActions,
  ImportCategory,
} from "../../types/importTypes";

interface ImportFormProps {
  onSuccess?: () => void;
}

const CATEGORY_LABEL: Record<ImportCategory, string> = {
  new: "Baru",
  unchanged: "Tidak berubah",
  changed: "Data berbeda",
  moved: "Kelas berbeda",
  error: "Error",
};

const CATEGORY_STYLE: Record<ImportCategory, string> = {
  new: "bg-green-100 text-green-800",
  unchanged: "bg-gray-100 text-gray-700",
  changed: "bg-yellow-100 text-yellow-800",
  moved: "bg-blue-100 text-blue-800",
  error: "bg-red-100 text-red-800",
};

const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "https://backend.man3kulonprogo.sch.id";

export const ImportForm: React.FC<ImportFormProps> = ({ onSuccess }) => {
  const { token } = useAuth();
  const { isWorking, preview, commitResult, error, runPreview, runCommit, reset } =
    useImportStudent();

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [yearId, setYearId] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<ImportCategory | "all">("all");
  const [actions, setActions] = useState<ImportActions>({
    changed: "skip",
    moved: "skip",
  });

  useEffect(() => {
    if (!token) return;
    fetchAcademicYears(token)
      .then((list) => {
        setYears(list);
        const current = list.find((y) => y.is_current) || list[list.length - 1];
        if (current) setYearId(current.id);
      })
      .catch(() => setYears([]));
  }, [token]);

  const handlePreview = () => {
    if (file && yearId) runPreview(file, yearId);
  };

  const handleCommit = async () => {
    const ok = await runCommit(actions);
    if (ok && onSuccess) onSuccess();
  };

  const rows = preview
    ? preview.rows.filter((r) => filter === "all" || r.category === filter)
    : [];

  if (commitResult) {
    return (
      <div className="space-y-4">
        <div className="flex items-center text-green-700">
          <CheckCircle2 className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-semibold">Import selesai</h3>
        </div>
        <ul className="text-sm text-foreground space-y-1">
          <li>Siswa baru: {commitResult.created}</li>
          <li>Data diperbarui: {commitResult.updated}</li>
          <li>Dipindah kelas: {commitResult.moved}</li>
          <li>Dilewati: {commitResult.skipped}</li>
        </ul>
        <button type="button" onClick={reset} className="btn btn-secondary">
          Import file lain
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <a
          href={`${backendUrl}/api/students/template`}
          className="text-sm text-accent flex items-center hover:underline"
        >
          <Download className="h-4 w-4 mr-1" />
          Unduh template
        </a>
      </div>

      {!preview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="import-year"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Tahun ajaran tujuan
            </label>
            <select
              id="import-year"
              className="form-input w-full"
              value={yearId}
              onChange={(e) => setYearId(Number(e.target.value))}
              disabled={isWorking}
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.label}
                  {y.is_current ? " (berjalan)" : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-secondary mt-1">
              Kelas di file dicocokkan dengan kelas pada tahun ajaran ini.
            </p>
          </div>
          <div>
            <label
              htmlFor="import-file"
              className="block text-sm font-medium text-foreground mb-1"
            >
              File Excel (.xlsx / .xls)
            </label>
            <input
              id="import-file"
              type="file"
              accept=".xlsx,.xls"
              className="form-input w-full"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isWorking}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start text-red-700 bg-red-50 rounded-md p-3 text-sm">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!preview && (
        <button
          type="button"
          onClick={handlePreview}
          disabled={isWorking || !file || !yearId}
          className="btn btn-primary flex items-center"
        >
          <Upload className="h-5 w-5 mr-2" />
          {isWorking ? "Membaca file..." : "Pratinjau"}
        </button>
      )}

      {preview && (
        <div className="space-y-4">
          {preview.file_seen_before && (
            <div className="flex items-start text-yellow-800 bg-yellow-50 rounded-md p-3 text-sm">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>
                File dengan isi yang sama pernah diimport. Baris yang sudah ada
                akan tampil sebagai "Tidak berubah" dan tidak mengubah apa pun.
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`btn ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
            >
              Semua ({preview.rows.length})
            </button>
            {(Object.keys(CATEGORY_LABEL) as ImportCategory[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`btn ${filter === c ? "btn-primary" : "btn-secondary"}`}
              >
                {CATEGORY_LABEL[c]} ({preview.counts[c]})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="action-changed"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Baris "Data berbeda" ({preview.counts.changed})
              </label>
              <select
                id="action-changed"
                className="form-input w-full"
                value={actions.changed}
                onChange={(e) =>
                  setActions({
                    ...actions,
                    changed: e.target.value as ImportActions["changed"],
                  })
                }
              >
                <option value="skip">Biarkan data lama</option>
                <option value="update">Perbarui dengan data file</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="action-moved"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Baris "Kelas berbeda" ({preview.counts.moved})
              </label>
              <select
                id="action-moved"
                className="form-input w-full"
                value={actions.moved}
                onChange={(e) =>
                  setActions({
                    ...actions,
                    moved: e.target.value as ImportActions["moved"],
                  })
                }
              >
                <option value="skip">Biarkan kelas lama</option>
                <option value="move">Pindahkan ke kelas di file</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto border border-border rounded-md">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-background">
                <tr className="text-left text-secondary">
                  <th className="p-2">Baris</th>
                  <th className="p-2">NISN</th>
                  <th className="p-2">Nama</th>
                  <th className="p-2">Kelas</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.worksheet}-${r.row}`} className="border-t border-border">
                    <td className="p-2">{r.row}</td>
                    <td className="p-2">{r.nisn}</td>
                    <td className="p-2">{r.name}</td>
                    <td className="p-2">
                      {r.current_class_name && r.current_class_name !== r.class_name
                        ? `${r.current_class_name} → ${r.class_name}`
                        : r.class_name || "-"}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${CATEGORY_STYLE[r.category]}`}
                      >
                        {CATEGORY_LABEL[r.category]}
                      </span>
                    </td>
                    <td className="p-2 text-secondary">
                      {r.errors?.join("; ") ||
                        r.diff?.map((d) => d.field).join(", ") ||
                        ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={reset}
              disabled={isWorking}
              className="btn btn-secondary"
            >
              Ganti file
            </button>
            <button
              type="button"
              onClick={handleCommit}
              disabled={isWorking}
              className="btn btn-primary"
            >
              {isWorking ? "Menyimpan..." : "Simpan import"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
