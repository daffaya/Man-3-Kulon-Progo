/**
 * @fileoverview CmsHomeForm — CMS editor for the homepage.
 *
 * Sections editable:
 * - Stats: jumlah guru, ekskul, prestasi
 * - About: judul, deskripsi, YouTube URL
 * - Hero: title, subtitle, description, background image, siswa image, CTA buttons
 * - Survey SPAK: judul, deskripsi, skor, kategori, URL detail, flyer image
 * - Survey SPKP: same as SPAK
 * - Slider: managed via site_collections (add/edit/delete/reorder slides)
 *
 * Route: /atmin/cms/home
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart2,
  Info,
  Image,
  Layout,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import CmsLayout from "../../../components/layout/CmsLayout";
import ImageUploader from "../../../components/ui/ImageUploader";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { apiFetch } from "../../../lib/api";
import {
  SectionCard,
  Field,
  TextareaField,
  saveSection,
  PageLoadingSpinner,
  CmsPageHeader,
} from "../../../components/cms/CmsFormComponents";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface StatsData {
  guru: string;
  ekskul: string;
  prestasi: string;
}

interface AboutData {
  title: string;
  description: string;
  youtube_url: string;
}

interface CtaButton {
  text: string;
  url: string;
}

interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  bg_image: string;
  siswa_image: string;
  cta_primary: CtaButton;
  cta_secondary: CtaButton;
}

interface SurveyData {
  title: string;
  description: string;
  score: string;
  category: string;
  year: string;
  detail_url: string;
  flyer_image: string;
}

interface SlideItem {
  id?: number;
  src: string;
  headline: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

/**
 * CmsHomeForm — CMS editor for homepage.
 * Accessible only to super_admin.
 */
const CmsHomeForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [isLoadingData, setIsLoadingData] = useState(true);

  // ── Section loading states ──
  const [savingStats, setSavingStats] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const [savingHero, setSavingHero] = useState(false);
  const [savingSpak, setSavingSpak] = useState(false);
  const [savingSpkp, setSavingSpkp] = useState(false);
  const [savingSlide, setSavingSlide] = useState<number | null>(null);
  const [deletingSlide, setDeletingSlide] = useState<number | null>(null);

  // ── Section states ──
  const [stats, setStats] = useState<StatsData>({
    guru: "50",
    ekskul: "10+",
    prestasi: "50+",
  });
  const [about, setAbout] = useState<AboutData>({
    title: "Tentang MAN 3 Kulon Progo",
    description: "",
    youtube_url: "https://www.youtube.com/embed/Tpn9sT-VDCY",
  });
  const [hero, setHero] = useState<HeroData>({
    title: "MAN 3 Kulon Progo",
    subtitle: "Menuju Wilayah Birokrasi Bersih dan Melayani",
    description: "",
    bg_image: "/MAN_3_1.jpg",
    siswa_image: "/Siswa_ZI.png",
    cta_primary: {
      text: "Lihat Komitmen Zona Integritas",
      url: "/layanan/zona-integritas",
    },
    cta_secondary: { text: "Hasil e-Survey", url: "" },
  });
  const [spak, setSpak] = useState<SurveyData>({
    title: "Survei Persepsi Anti Korupsi (SPAK) 2025",
    description: "",
    score: "3.87",
    category: "Sangat Baik",
    year: "2025",
    detail_url: "",
    flyer_image: "/SPAK_Triwulan_4.jpg",
  });
  const [spkp, setSpkp] = useState<SurveyData>({
    title: "Survei Persepsi Kualitas Pelayanan (SPKP) 2025",
    description: "",
    score: "3.95",
    category: "Sangat Baik",
    year: "2025",
    detail_url: "",
    flyer_image: "/SPKP_Triwulan_4.jpeg",
  });
  const [slides, setSlides] = useState<SlideItem[]>([]);

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/cms/home" } });
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
        const [homeData, slidesData] = await Promise.all([
          apiFetch("/cms/home"),
          apiFetch("/atmin/cms/collections/slider", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
            },
          }),
        ]);

        if (homeData.stats) setStats(homeData.stats);
        if (homeData.about) setAbout(homeData.about);
        if (homeData.hero) setHero(homeData.hero);
        if (homeData.survey_spak) setSpak(homeData.survey_spak);
        if (homeData.survey_spkp) setSpkp(homeData.survey_spkp);
        if (Array.isArray(slidesData)) setSlides(slidesData);
      } catch {
        showErrorToast("Gagal memuat data CMS Homepage.");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (!isLoadingAuth && isLoggedIn && user?.role === "super_admin") {
      fetchData();
    }
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save handlers ──

  const handleSaveStats = useCallback(async () => {
    setSavingStats(true);
    try {
      await saveSection("home", "stats", stats);
      showSuccessToast("Stats berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan stats.");
      throw new Error("failed");
    } finally {
      setSavingStats(false);
    }
  }, [stats, showSuccessToast, showErrorToast]);

  const handleSaveAbout = useCallback(async () => {
    setSavingAbout(true);
    try {
      await saveSection("home", "about", about);
      showSuccessToast("About berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan about.");
      throw new Error("failed");
    } finally {
      setSavingAbout(false);
    }
  }, [about, showSuccessToast, showErrorToast]);

  const handleSaveHero = useCallback(async () => {
    setSavingHero(true);
    try {
      await saveSection("home", "hero", hero);
      showSuccessToast("Hero berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan hero.");
      throw new Error("failed");
    } finally {
      setSavingHero(false);
    }
  }, [hero, showSuccessToast, showErrorToast]);

  const handleSaveSpak = useCallback(async () => {
    setSavingSpak(true);
    try {
      await saveSection("home", "survey_spak", spak);
      showSuccessToast("Survey SPAK berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan SPAK.");
      throw new Error("failed");
    } finally {
      setSavingSpak(false);
    }
  }, [spak, showSuccessToast, showErrorToast]);

  const handleSaveSpkp = useCallback(async () => {
    setSavingSpkp(true);
    try {
      await saveSection("home", "survey_spkp", spkp);
      showSuccessToast("Survey SPKP berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan SPKP.");
      throw new Error("failed");
    } finally {
      setSavingSpkp(false);
    }
  }, [spkp, showSuccessToast, showErrorToast]);

  // ── Slide handlers ──

  const handleSaveSlide = useCallback(
    async (slide: SlideItem, index: number) => {
      setSavingSlide(index);
      try {
        const { id, ...data } = slide;
        if (id) {
          await apiFetch(`/atmin/cms/collections/slider/${id}`, {
            method: "PUT",
            body: JSON.stringify({
              data: {
                src: data.src,
                headline: data.headline,
                description: data.description,
              },
              sort_order: data.sort_order,
              is_active: data.is_active,
            }),
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
            },
          });
        } else {
          const res = await apiFetch("/atmin/cms/collections/slider", {
            method: "POST",
            body: JSON.stringify({
              data: {
                src: data.src,
                headline: data.headline,
                description: data.description,
              },
              sort_order: data.sort_order,
            }),
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
            },
          });
          setSlides((prev) =>
            prev.map((s, i) => (i === index ? { ...s, id: res.id } : s)),
          );
        }
        showSuccessToast(`Slide ${index + 1} berhasil disimpan.`);
      } catch {
        showErrorToast(`Gagal menyimpan slide ${index + 1}.`);
        throw new Error("failed");
      } finally {
        setSavingSlide(null);
      }
    },
    [showSuccessToast, showErrorToast],
  );

  const handleDeleteSlide = useCallback(
    async (slide: SlideItem, index: number) => {
      if (!slide.id) {
        setSlides((prev) => prev.filter((_, i) => i !== index));
        return;
      }
      setDeletingSlide(index);
      try {
        await apiFetch(`/atmin/cms/collections/slider/${slide.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          },
        });
        setSlides((prev) => prev.filter((_, i) => i !== index));
        showSuccessToast("Slide berhasil dihapus.");
      } catch {
        showErrorToast("Gagal menghapus slide.");
      } finally {
        setDeletingSlide(null);
      }
    },
    [showSuccessToast, showErrorToast],
  );

  const handleAddSlide = () => {
    setSlides((prev) => [
      ...prev,
      {
        src: "",
        headline: "",
        description: "",
        sort_order: prev.length + 1,
        is_active: true,
      },
    ]);
  };

  const updateSlide = (
    index: number,
    field: keyof SlideItem,
    value: string | boolean | number,
  ) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  // ── Loading ──
  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Homepage">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — Homepage">
      <div className="max-w-3xl mx-auto">
        <CmsPageHeader
          title="Kelola Konten Homepage"
          description="Perubahan yang disimpan akan langsung tampil di halaman utama website."
        />

        {/* ── Stats ── */}
        <SectionCard
          title="Statistik Sekolah"
          icon={<BarChart2 size={18} />}
          description="Angka yang ditampilkan di kotak statistik homepage."
          onSave={handleSaveStats}
          isSaving={savingStats}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label="Jumlah Guru & Staf"
              value={stats.guru}
              onChange={(v) => setStats((p) => ({ ...p, guru: v }))}
              placeholder="50"
              hint='Contoh: "52" atau "52+"'
            />
            <Field
              label="Ekstrakurikuler"
              value={stats.ekskul}
              onChange={(v) => setStats((p) => ({ ...p, ekskul: v }))}
              placeholder="10+"
            />
            <Field
              label="Prestasi"
              value={stats.prestasi}
              onChange={(v) => setStats((p) => ({ ...p, prestasi: v }))}
              placeholder="50+"
            />
          </div>
        </SectionCard>

        {/* ── About ── */}
        <SectionCard
          title="Tentang Sekolah"
          icon={<Info size={18} />}
          description='Konten di section "Tentang MAN 3 Kulon Progo".'
          onSave={handleSaveAbout}
          isSaving={savingAbout}
        >
          <div className="space-y-4">
            <Field
              label="Judul"
              value={about.title}
              onChange={(v) => setAbout((p) => ({ ...p, title: v }))}
            />
            <TextareaField
              label="Deskripsi"
              value={about.description}
              onChange={(v) => setAbout((p) => ({ ...p, description: v }))}
              rows={4}
            />
            <Field
              label="YouTube Embed URL"
              value={about.youtube_url}
              onChange={(v) => setAbout((p) => ({ ...p, youtube_url: v }))}
              placeholder="https://www.youtube.com/embed/..."
              hint='Gunakan format embed, bukan URL watch biasa. Contoh: "https://www.youtube.com/embed/XXXX"'
            />
          </div>
        </SectionCard>

        {/* ── Hero ── */}
        <SectionCard
          title="Hero Section"
          icon={<Layout size={18} />}
          description="Konten hero di bagian atas homepage."
          onSave={handleSaveHero}
          isSaving={savingHero}
        >
          <div className="space-y-4">
            <Field
              label="Judul"
              value={hero.title}
              onChange={(v) => setHero((p) => ({ ...p, title: v }))}
            />
            <Field
              label="Subjudul (teks accent)"
              value={hero.subtitle}
              onChange={(v) => setHero((p) => ({ ...p, subtitle: v }))}
            />
            <TextareaField
              label="Deskripsi"
              value={hero.description}
              onChange={(v) => setHero((p) => ({ ...p, description: v }))}
              rows={3}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Gambar Background
                </p>
                <ImageUploader
                  currentImage={hero.bg_image}
                  onImageChange={(_, url) => {
                    if (url) setHero((p) => ({ ...p, bg_image: url }));
                  }}
                  label=""
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Gambar Siswa (cutout kanan)
                </p>
                <ImageUploader
                  currentImage={hero.siswa_image}
                  onImageChange={(_, url) => {
                    if (url) setHero((p) => ({ ...p, siswa_image: url }));
                  }}
                  label=""
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  CTA Utama (tombol hijau)
                </p>
                <Field
                  label="Teks"
                  value={hero.cta_primary.text}
                  onChange={(v) =>
                    setHero((p) => ({
                      ...p,
                      cta_primary: { ...p.cta_primary, text: v },
                    }))
                  }
                />
                <Field
                  label="URL"
                  value={hero.cta_primary.url}
                  onChange={(v) =>
                    setHero((p) => ({
                      ...p,
                      cta_primary: { ...p.cta_primary, url: v },
                    }))
                  }
                  placeholder="/layanan/zona-integritas"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  CTA Sekunder (tombol outline)
                </p>
                <Field
                  label="Teks"
                  value={hero.cta_secondary.text}
                  onChange={(v) =>
                    setHero((p) => ({
                      ...p,
                      cta_secondary: { ...p.cta_secondary, text: v },
                    }))
                  }
                />
                <Field
                  label="URL"
                  value={hero.cta_secondary.url}
                  onChange={(v) =>
                    setHero((p) => ({
                      ...p,
                      cta_secondary: { ...p.cta_secondary, url: v },
                    }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Survey SPAK ── */}
        <SectionCard
          title="Survey SPAK"
          icon={<BarChart2 size={18} />}
          description="Data Survei Persepsi Anti Korupsi yang ditampilkan di homepage."
          onSave={handleSaveSpak}
          isSaving={savingSpak}
        >
          <div className="space-y-4">
            <Field
              label="Judul"
              value={spak.title}
              onChange={(v) => setSpak((p) => ({ ...p, title: v }))}
            />
            <TextareaField
              label="Deskripsi"
              value={spak.description}
              onChange={(v) => setSpak((p) => ({ ...p, description: v }))}
              rows={2}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field
                label="Skor"
                value={spak.score}
                onChange={(v) => setSpak((p) => ({ ...p, score: v }))}
                placeholder="3.87"
              />
              <Field
                label="Kategori"
                value={spak.category}
                onChange={(v) => setSpak((p) => ({ ...p, category: v }))}
                placeholder="Sangat Baik"
              />
              <Field
                label="Tahun"
                value={spak.year}
                onChange={(v) => setSpak((p) => ({ ...p, year: v }))}
                placeholder="2025"
              />
            </div>
            <Field
              label="URL Detail Survei"
              value={spak.detail_url}
              onChange={(v) => setSpak((p) => ({ ...p, detail_url: v }))}
              placeholder="https://sites.google.com/..."
            />
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Flyer / Gambar Hasil Survei
              </p>
              <ImageUploader
                currentImage={spak.flyer_image}
                onImageChange={(_, url) => {
                  if (url) setSpak((p) => ({ ...p, flyer_image: url }));
                }}
                label=""
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Survey SPKP ── */}
        <SectionCard
          title="Survey SPKP"
          icon={<BarChart2 size={18} />}
          description="Data Survei Persepsi Kualitas Pelayanan yang ditampilkan di homepage."
          onSave={handleSaveSpkp}
          isSaving={savingSpkp}
        >
          <div className="space-y-4">
            <Field
              label="Judul"
              value={spkp.title}
              onChange={(v) => setSpkp((p) => ({ ...p, title: v }))}
            />
            <TextareaField
              label="Deskripsi"
              value={spkp.description}
              onChange={(v) => setSpkp((p) => ({ ...p, description: v }))}
              rows={2}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field
                label="Skor"
                value={spkp.score}
                onChange={(v) => setSpkp((p) => ({ ...p, score: v }))}
                placeholder="3.95"
              />
              <Field
                label="Kategori"
                value={spkp.category}
                onChange={(v) => setSpkp((p) => ({ ...p, category: v }))}
                placeholder="Sangat Baik"
              />
              <Field
                label="Tahun"
                value={spkp.year}
                onChange={(v) => setSpkp((p) => ({ ...p, year: v }))}
                placeholder="2025"
              />
            </div>
            <Field
              label="URL Detail Survei"
              value={spkp.detail_url}
              onChange={(v) => setSpkp((p) => ({ ...p, detail_url: v }))}
              placeholder="https://sites.google.com/..."
            />
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Flyer / Gambar Hasil Survei
              </p>
              <ImageUploader
                currentImage={spkp.flyer_image}
                onImageChange={(_, url) => {
                  if (url) setSpkp((p) => ({ ...p, flyer_image: url }));
                }}
                label=""
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Slider ── */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="text-accent">
                <Image size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Slider / Carousel Homepage
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Kelola slide yang tampil di carousel atas homepage. Simpan
                  tiap slide secara terpisah.
                </p>
              </div>
            </div>
            <button
              onClick={handleAddSlide}
              className="flex items-center gap-2 btn btn-secondary text-sm flex-shrink-0"
            >
              <Plus size={14} /> Tambah Slide
            </button>
          </div>

          <div className="border-t border-border mb-4" />

          <div className="space-y-6">
            {slides.map((slide, index) => (
              <div
                key={index}
                className="p-4 bg-semibackground rounded-lg border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">
                    Slide {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Active toggle */}
                    <label className="flex items-center gap-1.5 text-xs text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.is_active}
                        onChange={(e) =>
                          updateSlide(index, "is_active", e.target.checked)
                        }
                        className="rounded"
                      />
                      Aktif
                    </label>

                    {/* Save slide */}
                    <button
                      onClick={() => handleSaveSlide(slide, index)}
                      disabled={savingSlide === index}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium btn btn-primary"
                    >
                      {savingSlide === index ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : null}
                      Simpan
                    </button>

                    {/* Delete slide */}
                    <button
                      onClick={() => handleDeleteSlide(slide, index)}
                      disabled={deletingSlide === index}
                      className="p-1.5 text-secondary hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                      aria-label="Hapus slide"
                    >
                      {deletingSlide === index ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Gambar Slide
                    </p>
                    <ImageUploader
                      currentImage={slide.src}
                      onImageChange={(_, url) => {
                        if (url) updateSlide(index, "src", url);
                      }}
                      label=""
                    />
                  </div>
                  <Field
                    label="Headline"
                    value={slide.headline}
                    onChange={(v) => updateSlide(index, "headline", v)}
                    placeholder="Judul slide..."
                  />
                  <Field
                    label="Deskripsi"
                    value={slide.description}
                    onChange={(v) => updateSlide(index, "description", v)}
                    placeholder="Deskripsi singkat..."
                  />
                  <Field
                    label="Urutan (sort order)"
                    value={String(slide.sort_order)}
                    onChange={(v) =>
                      updateSlide(index, "sort_order", parseInt(v) || 0)
                    }
                    type="number"
                    hint="Slide dengan angka lebih kecil tampil lebih dulu."
                  />
                </div>
              </div>
            ))}

            {slides.length === 0 && (
              <p className="text-sm text-secondary/60 italic text-center py-6 border border-dashed border-border rounded-lg">
                Belum ada slide. Klik "+ Tambah Slide" untuk menambahkan.
              </p>
            )}
          </div>
        </div>
      </div>
    </CmsLayout>
  );
};

export default CmsHomeForm;
