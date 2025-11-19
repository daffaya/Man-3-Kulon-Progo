/**
 * @fileoverview Modal component for bulk moving students between classes or graduating them.
 * This component provides a form interface for selecting source/destination classes,
 * academic year, and action type (move or graduate). It includes validation, API calls,
 * and confirmation dialogs for the bulk operations.
 */

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import { studentService } from "../../services/studentService";
import { Class, Angkatan } from "../../types/studentTypes";
import { X } from "lucide-react";

/**
 * Props for the BulkMoveClassModal component
 * @interface BulkMoveClassModalProps
 */
interface BulkMoveClassModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to call when the modal is closed */
  onClose: () => void;
  /** Function to call when the operation is successful */
  onSuccess: () => void;
  /** Array of available classes */
  classes: Class[];
  /** Array of available angkatans (batches) */
  angkatans: Angkatan[];
}

/**
 * Modal component for bulk moving students between classes or graduating them.
 * Provides a form interface for selecting source/destination classes, academic year,
 * and action type (move or graduate). Includes validation, API calls, and confirmation dialogs.
 *
 * @param {BulkMoveClassModalProps} props - The component props
 * @returns {JSX.Element} The rendered modal component
 */
const BulkMoveClassModal: React.FC<BulkMoveClassModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  classes,
  angkatans,
}) => {
  const { token } = useAuth();
  const { showErrorToast, showSuccessToast } = useToastMessage();
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

  // State for filtered classes
  const [filteredClasses, setFilteredClasses] = useState<{
    from: Class[];
    to: Class[];
  }>({
    from: [],
    to: [],
  });
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Use ref to store the latest form state
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  /**
   * Determines the class level from the class name
   * @param {string} className - The class name (e.g., "X-A", "XI-B", "XII-C")
   * @returns {string} The class level (X, XI, or XII)
   */
  const getClassLevel = (className: string): string => {
    const match = className.match(/^(X|XI|XII)-/);
    return match ? match[1] : "";
  };

  /**
   * Gets the next class level
   * @param {string} currentLevel - The current class level
   * @returns {string} The next class level
   */
  const getNextLevel = (currentLevel: string): string => {
    const levels = ["X", "XI", "XII"];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex >= 0 && currentIndex < levels.length - 1
      ? levels[currentIndex + 1]
      : "";
  };

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch classes based on selected angkatan
  useEffect(() => {
    const fetchClassesByAngkatan = async () => {
      if (!formData.angkatan || !token) {
        setFilteredClasses({ from: [], to: [] });
        return;
      }

      setLoadingClasses(true);
      try {
        const classesForAngkatan = await studentService.getClassesByAngkatan(
          token,
          formData.angkatan
        );
        setFilteredClasses((prev) => ({ ...prev, from: classesForAngkatan }));

        // Reset class selections
        setFormData((prev) => ({ ...prev, classIdFrom: "", classIdTo: "" }));
      } catch (error) {
        showErrorToast(
          error instanceof Error ? error.message : "Gagal memuat kelas"
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
  }, [formData.angkatan, token, showErrorToast]);

  // Fetch destination classes based on selected source class
  useEffect(() => {
    const fetchToClasses = async () => {
      if (!formData.classIdFrom || !token || formData.action !== "move") {
        setFilteredClasses((prev) => ({ ...prev, to: [] }));
        return;
      }

      setLoadingClasses(true);
      try {
        const fromClass = filteredClasses.from.find(
          (cls) => cls.id === Number(formData.classIdFrom)
        );
        if (!fromClass) {
          setFilteredClasses((prev) => ({ ...prev, to: [] }));
          return;
        }

        const fromLevel = getClassLevel(fromClass.name);
        if (!fromLevel) {
          setFilteredClasses((prev) => ({ ...prev, to: [] }));
          return;
        }

        const toLevel = getNextLevel(fromLevel);
        if (!toLevel) {
          setFilteredClasses((prev) => ({ ...prev, to: [] }));
          return;
        }

        const toClasses = await studentService.getClassesByLevel(
          token,
          toLevel
        );
        setFilteredClasses((prev) => ({ ...prev, to: toClasses }));

        // Reset destination class selection
        setFormData((prev) => ({ ...prev, classIdTo: "" }));
      } catch (error) {
        showErrorToast(
          error instanceof Error ? error.message : "Gagal memuat kelas tujuan"
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
    showErrorToast,
  ]);

  // Update fromClassLevel when source class changes
  useEffect(() => {
    if (formData.classIdFrom && filteredClasses.from.length > 0) {
      const fromClass = filteredClasses.from.find(
        (cls) => cls.id === Number(formData.classIdFrom)
      );
      if (fromClass) {
        const level = getClassLevel(fromClass.name);
        setFromClassLevel(level);

        // Reset action to "move" if selected class is not XII
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
  }, [formData.classIdFrom, filteredClasses.from]);

  // Fetch count of students to move when class or angkatan changes
  useEffect(() => {
    const fetchStudentsToMoveCount = async () => {
      if (!formData.classIdFrom || !formData.angkatan || !token) {
        return;
      }

      try {
        setLoading(true);

        const response = await studentService.getStudents({
          token,
          classId: Number(formData.classIdFrom),
          angkatan: formData.angkatan,
        });

        const students =
          (response as any).data || (response as any).students || response;

        const count = Array.isArray(students) ? students.length : 0;

        setStudentsToMoveCount(count);
      } catch (error) {
        setStudentsToMoveCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsToMoveCount();
  }, [formData.classIdFrom, formData.angkatan, token]);

  /**
   * Handles form submission
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form based on action
    if (formData.action === "move") {
      if (
        !formData.classIdFrom ||
        !formData.classIdTo ||
        !formData.academicYear ||
        !formData.angkatan
      ) {
        showErrorToast(
          "Kelas asal, tujuan, tahun ajaran, dan angkatan wajib diisi"
        );
        return;
      }
    } else if (formData.action === "graduate") {
      if (
        !formData.classIdFrom ||
        !formData.academicYear ||
        !formData.angkatan
      ) {
        showErrorToast("Kelas asal, tahun ajaran, dan angkatan wajib diisi");
        return;
      }

      // Additional validation for graduate action
      if (fromClassLevel !== "XII") {
        showErrorToast("Aksi luluskan hanya tersedia untuk kelas XII");
        return;
      }
    }

    setShowConfirmation(true);
  };

  /**
   * Confirms and executes the bulk move or graduate operation
   */
  const confirmAction = async () => {
    setLoading(true);
    try {
      let result: any;
      let actionText: string;
      let count: number;

      if (formDataRef.current.action === "move") {
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

      showSuccessToast(
        `${result.message}. ${count} siswa berhasil ${actionText}`
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      showErrorToast(error.message || "Gagal memproses");
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  /**
   * Cancels the action and closes the confirmation dialog
   */
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Kenaikan Kelas / Kelulusan
          </h3>
          <button
            onClick={onClose}
            className="text-secondary hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">
              Angkatan
            </label>
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
              <p className="text-sm text-error mt-1">
                Tidak ada data angkatan yang tersedia
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">
              Kelas Asal
            </label>
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
                <p className="text-sm text-error mt-1">
                  Tidak ada kelas untuk angkatan ini
                </p>
              )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">
              Aksi
            </label>
            <select
              value={formData.action}
              onChange={(e) => {
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
              {/* Only show "Graduate" option if source class is XII */}
              {fromClassLevel === "XII" && (
                <option value="graduate">Luluskan</option>
              )}
            </select>
            {formData.classIdFrom && fromClassLevel !== "XII" && (
              <p className="text-sm text-secondary mt-1">
                Opsi "Luluskan" hanya tersedia untuk kelas XII
              </p>
            )}
          </div>

          {formData.action === "move" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">
                Kelas Tujuan
              </label>
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
                  <p className="text-sm text-error mt-1">
                    Tidak ada kelas tujuan yang tersedia
                  </p>
                )}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">
              Tahun Ajaran
            </label>
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
            <div className="mb-4 p-3 bg-accent/10 rounded-md">
              <p className="text-sm text-accent">
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 text-foreground">
                Konfirmasi
              </h3>
              <p className="mb-6 text-secondary">
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
