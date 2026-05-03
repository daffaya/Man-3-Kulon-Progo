/**
 * @fileoverview CmsPmbmForm — CMS editor for PMBM page.
 *
 * Sections editable:
 * - Config: gelombang aktif, gelombang tampil, batas pendaftaran G1 & G2
 * - Jadwal G1 & G2: label dan tanggal per item
 * - Kontak: email dan daftar kontak WhatsApp tim PMBM
 * - Tentang: deskripsi dan CTA bold
 *
 * Each section is an independent card with its own save button.
 * Saving one section does NOT affect others.
 *
 * Route: /atmin/cms/pmbm
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Phone,
  Mail,
  Settings,
  Info,
} from "lucide-react";
import CmsLayout from "../../../components/layout/CmsLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { apiFetch } from "../../../lib/api";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface JadwalItem {
  label: string;
  value: string;
}

interface KontakPerson {
  nama: string;
  wa: string;
  display: string;
}

interface PmbmConfig {
  gelombang_aktif: 1 | 2 | null;
  gelombang_tampil: 1 | 2;
  batas_g1: string;
  batas_g2: string;
}

interface PmbmTentang {
  description: string;
  description2: string;
  cta_bold: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Saves a single CMS section via PUT /api/atmin/cms/:page/:section.
 * @param page - CMS page key
 * @param section - Section key within the page
 * @param data - Data object to save
 */
const saveSection = async (page: string, section: string, data: unknown) => {
  await apiFetch(`/atmin/cms/${page}/${section}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
    },
  });
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/**
 * Section card wrapper with title, icon, and save button.
 */
const SectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  description?: string;
  onSave: () => Promise<void>;
  isSaving: boolean;
  children: React.ReactNode;
}> = ({ title, icon, description, onSave, isSaving, children }) => {
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const handleSave = async () => {
    try {
      await onSave();
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  return (
    <div className="card p-6 mb-6">
      {/* Card header */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="text-accent">{icon}</div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-xs text-secondary mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
            saveStatus === "success"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : saveStatus === "error"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "btn btn-primary"
          }`}
        >
          {isSaving ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : saveStatus === "success" ? (
            <CheckCircle size={14} />
          ) : saveStatus === "error" ? (
            <AlertCircle size={14} />
          ) : (
            <Save size={14} />
          )}
          {isSaving
            ? "Menyimpan..."
            : saveStatus === "success"
              ? "Tersimpan!"
              : saveStatus === "error"
                ? "Gagal"
                : "Simpan"}
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-4" />

      {/* Content */}
      {children}
    </div>
  );
};

/**
 * Reusable text input field with label.
 */
const Field: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  disabled,
}) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="form-input w-full"
    />
    {hint && <p className="text-xs text-secondary mt-1">{hint}</p>}
  </div>
);

/**
 * Reusable textarea field with label.
 */
const TextareaField: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
}> = ({ label, value, onChange, rows = 3, placeholder, hint }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="form-input w-full resize-none"
    />
    {hint && <p className="text-xs text-secondary mt-1">{hint}</p>}
  </div>
);

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

/**
 * CmsPmbmForm — CMS editor for all PMBM page sections.
 * Accessible only to super_admin.
 */
const CmsPmbmForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  // ── Loading states per section ──
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingJadwalG1, setSavingJadwalG1] = useState(false);
  const [savingJadwalG2, setSavingJadwalG2] = useState(false);
  const [savingKontak, setSavingKontak] = useState(false);
  const [savingTentang, setSavingTentang] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ── Section states ──
  const [config, setConfig] = useState<PmbmConfig>({
    gelombang_aktif: 2,
    gelombang_tampil: 1,
    batas_g1: "2026-04-27",
    batas_g2: "",
  });

  const [jadwalG1, setJadwalG1] = useState<JadwalItem[]>([
    {
      label: "Pendaftaran Online (Gelombang I)",
      value: "1 April – 17 April 2026",
    },
    { label: "Seleksi", value: "20 April – 22 April 2026" },
    { label: "Pengumuman Hasil Seleksi", value: "23 April 2026" },
    { label: "Lapor Diri", value: "24 April 2026" },
  ]);

  const [jadwalG2, setJadwalG2] = useState<JadwalItem[]>([
    { label: "Pendaftaran Online (Gelombang II)", value: "" },
    { label: "Pelaksanaan Tes", value: "" },
    { label: "Pengumuman Hasil Tes", value: "" },
    { label: "Lapor Diri", value: "" },
  ]);

  const [kontakEmail, setKontakEmail] = useState("man3kulonprogo@gmail.com");
  const [kontakPersons, setKontakPersons] = useState<KontakPerson[]>([
    {
      nama: "Isti Wulandari",
      wa: "6285743881574",
      display: "+62 857-4388-1574",
    },
    { nama: "Wijiardani", wa: "6283189810114", display: "+62 831-8981-0114" },
  ]);

  const [tentang, setTentang] = useState<PmbmTentang>({
    description: "",
    description2: "",
    cta_bold: "",
  });

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/cms/pmbm" } });
      return;
    }
    if (user?.role !== "super_admin") {
      showErrorToast("Hanya Super Admin yang dapat mengakses halaman ini.");
      navigate("/atmin");
    }
  }, [isLoadingAuth, isLoggedIn, user, navigate, showErrorToast]);

  // ── Fetch current data ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiFetch("/cms/pmbm");

        if (data.config) setConfig(data.config);
        if (data.jadwal_g1?.items) setJadwalG1(data.jadwal_g1.items);
        if (data.jadwal_g2?.items) setJadwalG2(data.jadwal_g2.items);
        if (data.kontak) {
          setKontakEmail(data.kontak.email ?? "");
          setKontakPersons(data.kontak.contacts ?? []);
        }
        if (data.tentang) setTentang(data.tentang);
      } catch {
        showErrorToast("Gagal memuat data CMS PMBM.");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (!isLoadingAuth && isLoggedIn && user?.role === "super_admin") {
      fetchData();
    }
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save handlers ──

  const handleSaveConfig = useCallback(async () => {
    setSavingConfig(true);
    try {
      await saveSection("pmbm", "config", config);
      showSuccessToast("Config PMBM berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan config PMBM.");
      throw new Error("Save failed");
    } finally {
      setSavingConfig(false);
    }
  }, [config, showSuccessToast, showErrorToast]);

  const handleSaveJadwalG1 = useCallback(async () => {
    setSavingJadwalG1(true);
    try {
      await saveSection("pmbm", "jadwal_g1", { items: jadwalG1 });
      showSuccessToast("Jadwal Gelombang I berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan jadwal G1.");
      throw new Error("Save failed");
    } finally {
      setSavingJadwalG1(false);
    }
  }, [jadwalG1, showSuccessToast, showErrorToast]);

  const handleSaveJadwalG2 = useCallback(async () => {
    setSavingJadwalG2(true);
    try {
      await saveSection("pmbm", "jadwal_g2", { items: jadwalG2 });
      showSuccessToast("Jadwal Gelombang II berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan jadwal G2.");
      throw new Error("Save failed");
    } finally {
      setSavingJadwalG2(false);
    }
  }, [jadwalG2, showSuccessToast, showErrorToast]);

  const handleSaveKontak = useCallback(async () => {
    setSavingKontak(true);
    try {
      await saveSection("pmbm", "kontak", {
        email: kontakEmail,
        contacts: kontakPersons,
      });
      showSuccessToast("Kontak PMBM berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan kontak.");
      throw new Error("Save failed");
    } finally {
      setSavingKontak(false);
    }
  }, [kontakEmail, kontakPersons, showSuccessToast, showErrorToast]);

  const handleSaveTentang = useCallback(async () => {
    setSavingTentang(true);
    try {
      await saveSection("pmbm", "tentang", tentang);
      showSuccessToast("Deskripsi PMBM berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan deskripsi.");
      throw new Error("Save failed");
    } finally {
      setSavingTentang(false);
    }
  }, [tentang, showSuccessToast, showErrorToast]);

  // ── Jadwal item helpers ──

  const updateJadwalItem = (
    list: JadwalItem[],
    setList: React.Dispatch<React.SetStateAction<JadwalItem[]>>,
    index: number,
    field: keyof JadwalItem,
    value: string,
  ) => {
    setList(
      list.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  // ── Kontak person helpers ──

  const updateKontakPerson = (
    index: number,
    field: keyof KontakPerson,
    value: string,
  ) => {
    setKontakPersons((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const addKontakPerson = () => {
    setKontakPersons((prev) => [...prev, { nama: "", wa: "", display: "" }]);
  };

  const removeKontakPerson = (index: number) => {
    setKontakPersons((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Loading ──
  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — PMBM">
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      </CmsLayout>
    );
  }

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <CmsLayout title="CMS — PMBM">
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
            Kelola Konten PMBM
          </h2>
          <p className="text-secondary text-sm">
            Perubahan yang disimpan akan langsung tampil di halaman PMBM publik.
          </p>
        </div>

        {/* ── Section 1: Config ── */}
        <SectionCard
          title="Konfigurasi Gelombang"
          icon={<Settings size={18} />}
          description="Atur gelombang aktif, gelombang yang ditampilkan ke publik, dan batas tanggal pendaftaran."
          onSave={handleSaveConfig}
          isSaving={savingConfig}
        >
          <div className="space-y-4">
            {/* Gelombang aktif */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Gelombang Aktif
              </label>
              <select
                value={config.gelombang_aktif ?? "null"}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    gelombang_aktif:
                      e.target.value === "null"
                        ? null
                        : (parseInt(e.target.value) as 1 | 2),
                  }))
                }
                className="form-input w-full"
              >
                <option value="null">Tidak ada (pendaftaran ditutup)</option>
                <option value="1">Gelombang I</option>
                <option value="2">Gelombang II</option>
              </select>
              <p className="text-xs text-secondary mt-1">
                Pilih gelombang yang sedang menerima pendaftaran. "Tidak ada" =
                tutup semua pendaftaran.
              </p>
            </div>

            {/* Gelombang tampil */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Gelombang yang Ditampilkan ke Publik
              </label>
              <select
                value={config.gelombang_tampil}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    gelombang_tampil: parseInt(e.target.value) as 1 | 2,
                  }))
                }
                className="form-input w-full"
              >
                <option value="1">Gelombang I saja</option>
                <option value="2">Gelombang I & II</option>
              </select>
              <p className="text-xs text-secondary mt-1">
                Mengontrol tab mana yang bisa dilihat di halaman Status
                Pendaftaran.
              </p>
            </div>

            {/* Batas tanggal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Batas Pendaftaran Gelombang I"
                value={config.batas_g1}
                onChange={(val) =>
                  setConfig((prev) => ({ ...prev, batas_g1: val }))
                }
                type="date"
                hint="Pendaftaran ditutup otomatis setelah tanggal ini (akhir hari)."
              />
              <Field
                label="Batas Pendaftaran Gelombang II"
                value={config.batas_g2}
                onChange={(val) =>
                  setConfig((prev) => ({ ...prev, batas_g2: val }))
                }
                type="date"
                hint="Kosongkan jika belum ditentukan."
              />
            </div>

            {/* Status preview */}
            <div className="p-3 bg-semibackground rounded-lg border border-border">
              <p className="text-xs font-medium text-secondary mb-1 flex items-center gap-1">
                <Info size={12} /> Status saat ini
              </p>
              <p className="text-sm text-foreground">
                {config.gelombang_aktif === null
                  ? "🔴 Pendaftaran ditutup"
                  : `🟢 Gelombang ${config.gelombang_aktif} sedang dibuka`}
                {" · "}
                Status publik: Gelombang{" "}
                {config.gelombang_tampil === 1 ? "I saja" : "I & II"}{" "}
                ditampilkan
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── Section 2: Jadwal G1 ── */}
        <SectionCard
          title="Jadwal Gelombang I"
          icon={<Calendar size={18} />}
          description="Label dan tanggal kegiatan Gelombang I. Ditampilkan di halaman PMBM (mode read-only karena sudah tutup)."
          onSave={handleSaveJadwalG1}
          isSaving={savingJadwalG1}
        >
          <div className="space-y-4">
            {jadwalG1.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <Field
                  label={`Kegiatan ${index + 1}`}
                  value={item.label}
                  onChange={(val) =>
                    updateJadwalItem(jadwalG1, setJadwalG1, index, "label", val)
                  }
                  placeholder="Nama kegiatan"
                />
                <Field
                  label="Tanggal"
                  value={item.value}
                  onChange={(val) =>
                    updateJadwalItem(jadwalG1, setJadwalG1, index, "value", val)
                  }
                  placeholder="Contoh: 1 April – 17 April 2026"
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Section 3: Jadwal G2 ── */}
        <SectionCard
          title="Jadwal Gelombang II"
          icon={<Calendar size={18} />}
          description="Label dan tanggal kegiatan Gelombang II. Isi saat jadwal sudah ditentukan."
          onSave={handleSaveJadwalG2}
          isSaving={savingJadwalG2}
        >
          <div className="space-y-4">
            {jadwalG2.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <Field
                  label={`Kegiatan ${index + 1}`}
                  value={item.label}
                  onChange={(val) =>
                    updateJadwalItem(jadwalG2, setJadwalG2, index, "label", val)
                  }
                  placeholder="Nama kegiatan"
                />
                <Field
                  label="Tanggal"
                  value={item.value}
                  onChange={(val) =>
                    updateJadwalItem(jadwalG2, setJadwalG2, index, "value", val)
                  }
                  placeholder="Belum ditentukan"
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Section 4: Tentang ── */}
        <SectionCard
          title="Deskripsi PMBM"
          icon={<Info size={18} />}
          description='Teks di section "Tentang PMBM MAN 3 Kulon Progo".'
          onSave={handleSaveTentang}
          isSaving={savingTentang}
        >
          <div className="space-y-4">
            <TextareaField
              label="Paragraf 1"
              value={tentang.description}
              onChange={(val) =>
                setTentang((prev) => ({ ...prev, description: val }))
              }
              placeholder="MAN 3 Kulon Progo membuka PMBM..."
            />
            <TextareaField
              label="Paragraf 2"
              value={tentang.description2}
              onChange={(val) =>
                setTentang((prev) => ({ ...prev, description2: val }))
              }
              placeholder="Pendaftaran dapat dilakukan dari mana saja..."
            />
            <Field
              label="Teks CTA (bold)"
              value={tentang.cta_bold}
              onChange={(val) =>
                setTentang((prev) => ({ ...prev, cta_bold: val }))
              }
              placeholder="Segera daftarkan diri dan jadilah bagian dari..."
              hint="Teks ini ditampilkan tebal di akhir paragraf 2."
            />
          </div>
        </SectionCard>

        {/* ── Section 5: Kontak ── */}
        <SectionCard
          title="Kontak Tim PMBM"
          icon={<Phone size={18} />}
          description="Email dan nomor WhatsApp panitia PMBM yang ditampilkan di halaman PMBM."
          onSave={handleSaveKontak}
          isSaving={savingKontak}
        >
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                <Mail size={14} className="text-secondary" />
                Email
              </label>
              <input
                type="email"
                value={kontakEmail}
                onChange={(e) => setKontakEmail(e.target.value)}
                className="form-input w-full"
                placeholder="man3kulonprogo@gmail.com"
              />
            </div>

            {/* WhatsApp contacts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone size={14} className="text-secondary" />
                  Kontak WhatsApp
                </label>
                <button
                  onClick={addKontakPerson}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
                >
                  <Plus size={14} />
                  Tambah
                </button>
              </div>

              <div className="space-y-4">
                {kontakPersons.map((person, index) => (
                  <div
                    key={index}
                    className="p-4 bg-semibackground rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-secondary">
                        Kontak {index + 1}
                      </span>
                      {kontakPersons.length > 1 && (
                        <button
                          onClick={() => removeKontakPerson(index)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                          aria-label="Hapus kontak"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field
                        label="Nama"
                        value={person.nama}
                        onChange={(val) =>
                          updateKontakPerson(index, "nama", val)
                        }
                        placeholder="Nama lengkap"
                      />
                      <Field
                        label="Nomor WA (tanpa +)"
                        value={person.wa}
                        onChange={(val) => updateKontakPerson(index, "wa", val)}
                        placeholder="628xxxxxxxxxx"
                        hint="Untuk link wa.me/"
                      />
                      <Field
                        label="Tampilan"
                        value={person.display}
                        onChange={(val) =>
                          updateKontakPerson(index, "display", val)
                        }
                        placeholder="+62 8xx-xxxx-xxxx"
                        hint="Yang ditampilkan ke publik"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsPmbmForm;
