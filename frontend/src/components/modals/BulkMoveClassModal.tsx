// src/components/modals/BulkMoveClassModal.tsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { studentService } from "../../services/studentService";
import { Class, Angkatan } from "../../types/studentTypes";
import { X } from "lucide-react";
import Toast from "../ui/Toast";

interface BulkMoveClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showToast?: (message: string, type?: "success" | "error" | "warning") => void;
  classes: Class[];
  angkatans: Angkatan[];
}

const BulkMoveClassModal: React.FC<BulkMoveClassModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  showToast,
  classes,
  angkatans,
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    angkatan: "",
    classIdFrom: "",
    classIdTo: "",
    academicYear: "",
    action: "move" as "move" | "graduate",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentsToMoveCount, setStudentsToMoveCount] = useState<number>(0);
  const [fromClassLevel, setFromClassLevel] = useState<string>("");

  // State untuk kelas yang difilter
  const [filteredClasses, setFilteredClasses] = useState<{
    from: Class[];
    to: Class[];
  }>({
    from: [],
    to: [],
  });
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Gunakan ref untuk menyimpan state form terbaru
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Fungsi untuk menentukan level dari nama kelas
  // Fungsi untuk menentukan level dari nama kelas
  const getClassLevel = (className: string): string => {
    // Asumsi nama kelas seperti "X-A", "XI-B", "XII-C"
    const match = className.match(/^(X|XI|XII)-/);
    return match ? match[1] : "";
  };

  // Fungsi untuk mendapatkan level berikutnya
  const getNextLevel = (currentLevel: string): string => {
    const levels = ["X", "XI", "XII"];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex >= 0 && currentIndex < levels.length - 1
      ? levels[currentIndex + 1]
      : "";
  };

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch kelas berdasarkan angkatan yang dipilih
  useEffect(() => {
    const fetchClassesByAngkatan = async () => {
      if (!formData.angkatan || !token) {
        setFilteredClasses({ from: [], to: [] });
        return;
      }

      setLoadingClasses(true);
      try {
        // Ambil kelas untuk angkatan ini
        const classesForAngkatan = await studentService.getClassesByAngkatan(
          token,
          formData.angkatan
        );
        setFilteredClasses((prev) => ({ ...prev, from: classesForAngkatan }));

        // Reset pilihan kelas asal dan tujuan
        setFormData((prev) => ({ ...prev, classIdFrom: "", classIdTo: "" }));
      } catch (error) {
        console.error("Error fetching classes by angkatan:", error);
        showToast?.(
          error instanceof Error ? error.message : "Gagal memuat kelas",
          "error"
        );
      } finally {
        setLoadingClasses(false);
      }
    };

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      fetchClassesByAngkatan();
    }, 500); // 500ms delay

    // Cleanup
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [formData.angkatan, token, showToast]);

  // Fetch kelas tujuan berdasarkan kelas asal yang dipilih
  useEffect(() => {
    const fetchToClasses = async () => {
      if (!formData.classIdFrom || !token || formData.action !== "move") {
        setFilteredClasses((prev) => ({ ...prev, to: [] }));
        return;
      }

      setLoadingClasses(true);
      try {
        // Cari kelas asal yang dipilih
        const fromClass = filteredClasses.from.find(
          (cls) => cls.id === Number(formData.classIdFrom)
        );
        if (!fromClass) {
          setFilteredClasses((prev) => ({ ...prev, to: [] }));
          return;
        }

        // Dapatkan level kelas asal
        const fromLevel = getClassLevel(fromClass.name);
        if (!fromLevel) {
          setFilteredClasses((prev) => ({ ...prev, to: [] }));
          return;
        }

        // Dapatkan level berikutnya
        const toLevel = getNextLevel(fromLevel);
        if (!toLevel) {
          setFilteredClasses((prev) => ({ ...prev, to: [] }));
          return;
        }

        // Ambil kelas untuk level berikutnya
        const toClasses = await studentService.getClassesByLevel(
          token,
          toLevel
        );
        setFilteredClasses((prev) => ({ ...prev, to: toClasses }));

        // Reset pilihan kelas tujuan
        setFormData((prev) => ({ ...prev, classIdTo: "" }));
      } catch (error) {
        console.error("Error fetching to classes:", error);
        showToast?.(
          error instanceof Error ? error.message : "Gagal memuat kelas tujuan",
          "error"
        );
      } finally {
        setLoadingClasses(false);
      }
    };

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      fetchToClasses();
    }, 500); // 500ms delay

    // Cleanup
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    formData.classIdFrom,
    formData.action,
    filteredClasses.from,
    token,
    showToast,
  ]);

  // useEffect untuk fromClassLevel (pisah)
  useEffect(() => {
    if (formData.classIdFrom && filteredClasses.from.length > 0) {
      const fromClass = filteredClasses.from.find(
        (cls) => cls.id === Number(formData.classIdFrom)
      );
      if (fromClass) {
        const level = getClassLevel(fromClass.name);
        setFromClassLevel(level);
        console.log("From class level:", level);

        // Reset aksi ke "move" jika kelas yang dipilih bukan XII
        if (level !== "XII" && formData.action === "graduate") {
          setFormData({
            ...formData,
            action: "move",
          });
        }
      } else {
        setFromClassLevel("");
      }
    } else {
      setFromClassLevel("");
    }
  }, [formData.classIdFrom, filteredClasses.from]); // Ini hanya untuk fromClassLevel

  {
    formData.classIdFrom && (
      <div className="mb-4">
        <label className="block text-sm font-medium">Aksi</label>
        <select
          value={formData.action}
          onChange={(e) => {
            console.log("Action changed to:", e.target.value);
            setFormData({
              ...formData,
              action: e.target.value as "move" | "graduate",
            });
          }}
          className="form-input w-full"
          required
        >
          <option value="move">Naik Kelas</option>
          {/* Hanya tampilkan opsi "Luluskan" jika kelas asal adalah XII */}
          {fromClassLevel === "XII" && (
            <option value="graduate">Luluskan</option>
          )}
        </select>
      </div>
    );
  }

  // Fetch count of students to move when class or angkatan changes
  useEffect(() => {
    console.log("🔍 useEffect for fetchStudentsToMoveCount triggered");
    console.log("📋 formData:", formData);
    console.log("🔑 token:", token ? "exists" : "not exists");

    // Di dalam useEffect kamu
    const fetchStudentsToMoveCount = async () => {
      if (!formData.classIdFrom || !formData.angkatan || !token) {
        // ... log skipping
        return;
      }

      try {
        setLoading(true);
        console.log(
          `🔄 Counting students for class: ${formData.classIdFrom}, angkatan: ${formData.angkatan}`
        );

        const response = await studentService.getStudents({
          token,
          classId: Number(formData.classIdFrom),
          angkatan: formData.angkatan,
        });

        const students =
          (response as any).data || (response as any).students || response;

        const count = Array.isArray(students) ? students.length : 0;

        console.log(`✅ Students count result: ${count}`);
        setStudentsToMoveCount(count);
      } catch (error) {
        console.error("❌ Error fetching students count:", error);
        setStudentsToMoveCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsToMoveCount();
  }, [formData.classIdFrom, formData.angkatan, token, showToast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form berdasarkan aksi
    if (formData.action === "move") {
      if (
        !formData.classIdFrom ||
        !formData.classIdTo ||
        !formData.academicYear ||
        !formData.angkatan
      ) {
        showToast?.(
          "Kelas asal, tujuan, tahun ajaran, dan angkatan wajib diisi",
          "error"
        );
        return;
      }
    } else if (formData.action === "graduate") {
      if (
        !formData.classIdFrom ||
        !formData.academicYear ||
        !formData.angkatan
      ) {
        showToast?.(
          "Kelas asal, tahun ajaran, dan angkatan wajib diisi",
          "error"
        );
        return;
      }

      // Validasi tambahan untuk aksi "Luluskan"
      if (fromClassLevel !== "XII") {
        showToast?.("Aksi luluskan hanya tersedia untuk kelas XII", "error");
        return;
      }
    }

    setShowConfirmation(true);
  };

  const confirmAction = async () => {
    setLoading(true);
    try {
      console.log("Action selected:", formDataRef.current.action);

      let result: any;
      let actionText: string;
      let count: number;

      if (formDataRef.current.action === "move") {
        console.log("Using bulkMoveClass endpoint");
        result = await studentService.bulkMoveClass(
          {
            classIdFrom: Number(formDataRef.current.classIdFrom),
            classIdTo: Number(formDataRef.current.classIdTo),
            academicYear: formDataRef.current.academicYear,
            angkatan: formDataRef.current.angkatan,
          },
          token
        );
        actionText = "dipindahkan";
        count = result.studentsMoved;
      } else if (formDataRef.current.action === "graduate") {
        console.log("Using graduateStudents endpoint");
        result = await studentService.graduateStudents(
          {
            classIdFrom: Number(formDataRef.current.classIdFrom),
            academicYear: formDataRef.current.academicYear,
            angkatan: formDataRef.current.angkatan,
          },
          token
        );
        actionText = "ditandai lulus";
        count = result.count;
      } else {
        throw new Error("Aksi tidak valid");
      }

      console.log("Operation result:", result);

      showToast?.(
        `${result.message}. ${count} siswa berhasil ${actionText}`,
        "success"
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error in confirmAction:", error);
      showToast?.(error.message || "Gagal memproses", "error");
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const cancelAction = () => {
    setShowConfirmation(false);
  };

  if (!isOpen || !token) return null;

  const fromClass = filteredClasses.from.find(
    (cls) => cls.id === Number(formData.classIdFrom)
  );
  const toClass = filteredClasses.to.find(
    (cls) => cls.id === Number(formData.classIdTo)
  );
  const selectedAngkatan = angkatans.find(
    (a) => String(a.angkatan) === String(formData.angkatan)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Kenaikan Kelas / Kelulusan</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Angkatan</label>
            <select
              value={formData.angkatan}
              onChange={(e) =>
                setFormData({ ...formData, angkatan: e.target.value })
              }
              className="form-input w-full"
              required
            >
              <option value="">Pilih Angkatan</option>
              {angkatans.map((angkatan) => (
                <option key={angkatan.angkatan} value={angkatan.angkatan}>
                  Angkatan {angkatan.angkatan} ({angkatan.count} siswa)
                </option>
              ))}
            </select>
            {angkatans.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                Tidak ada data angkatan yang tersedia
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Kelas Asal</label>
            <select
              value={formData.classIdFrom}
              onChange={(e) =>
                setFormData({ ...formData, classIdFrom: e.target.value })
              }
              className="form-input w-full"
              required
              disabled={!formData.angkatan || loadingClasses}
            >
              <option value="">Pilih Kelas Asal</option>
              {filteredClasses.from.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            {formData.angkatan &&
              filteredClasses.from.length === 0 &&
              !loadingClasses && (
                <p className="text-sm text-red-500 mt-1">
                  Tidak ada kelas untuk angkatan ini
                </p>
              )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Aksi</label>
            <select
              value={formData.action}
              onChange={(e) => {
                console.log("Action changed to:", e.target.value);
                setFormData({
                  ...formData,
                  action: e.target.value as "move" | "graduate",
                });
              }}
              className="form-input w-full"
              required
              disabled={!formData.classIdFrom}
            >
              <option value="move">Naik Kelas</option>
              {/* Hanya tampilkan opsi "Luluskan" jika kelas asal adalah XII */}
              {fromClassLevel === "XII" && (
                <option value="graduate">Luluskan</option>
              )}
            </select>
            {formData.classIdFrom && fromClassLevel !== "XII" && (
              <p className="text-sm text-gray-500 mt-1">
                Opsi "Luluskan" hanya tersedia untuk kelas XII
              </p>
            )}
          </div>

          {formData.action === "move" && (
            <div className="mb-4">
              <label className="block text-sm font-medium">Kelas Tujuan</label>
              <select
                value={formData.classIdTo}
                onChange={(e) =>
                  setFormData({ ...formData, classIdTo: e.target.value })
                }
                className="form-input w-full"
                required
                disabled={!formData.classIdFrom || loadingClasses}
              >
                <option value="">Pilih Kelas Tujuan</option>
                {filteredClasses.to.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {formData.classIdFrom &&
                filteredClasses.to.length === 0 &&
                !loadingClasses && (
                  <p className="text-sm text-red-500 mt-1">
                    Tidak ada kelas tujuan yang tersedia
                  </p>
                )}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium">Tahun Ajaran</label>
            <input
              type="text"
              value={formData.academicYear}
              onChange={(e) =>
                setFormData({ ...formData, academicYear: e.target.value })
              }
              placeholder="YYYY/YYYY"
              className="form-input w-full"
              required
            />
          </div>

          {formData.classIdFrom && formData.angkatan && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {studentsToMoveCount} siswa akan diproses dari kelas{" "}
                {fromClass?.name || "yang dipilih"}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                loading ||
                !formData.classIdFrom ||
                !formData.angkatan ||
                (formData.action === "move" && !formData.classIdTo)
              }
            >
              {loading ? "Memproses..." : "Simpan"}
            </button>
          </div>
        </form>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Konfirmasi</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Apakah Anda yakin ingin{" "}
                {formData.action === "move" ? "menaikkan kelas" : "meluluskan"}{" "}
                {studentsToMoveCount} siswa Angkatan {formData.angkatan} dari
                kelas {fromClass?.name || "yang dipilih"}{" "}
                {formData.action === "move"
                  ? `ke kelas ${toClass?.name || "yang dipilih"}`
                  : ""}
                ?
                <br />
                <span className="text-sm">
                  Tindakan ini tidak dapat dibatalkan.
                </span>
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelAction}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  onClick={confirmAction}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkMoveClassModal;
