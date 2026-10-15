/**
 * @fileoverview ArticleForm — editor artikel (sesuai mockup v2): kolom tulis di kiri
 * (judul, ringkasan, isi) dan panel "Pengaturan" di kanan (kategori, tag, gambar sampul).
 * Aksi utama (Simpan Draf / Terbitkan) ada di bilah atas. Opsi lanjutan (tanggal publikasi,
 * sematkan, URL gambar sampul) disembunyikan di <details> agar editor tetap ringkas.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  ArrowLeft,
  Bold,
  Eye,
  Heading2,
  Image as ImageIcon,
  ImagePlus,
  Italic,
  Link2,
  List,
  Loader2,
  Quote,
  X,
} from "lucide-react";
import type { Article, ArticleFormData } from "../../types/articleTypes";
import { useArticles } from "../../contexts/ArticleContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import articleApi from "../../api/articleApi";
import { fitImage } from "../../lib/imageCompress";
import ArticleContent from "../article/ArticleContent";

interface ArticleFormProps {
  /** Artikel yang sedang diedit (kosong = artikel baru). */
  article?: Article;
  /** Kirim data ke API. Kembalikan false jika gagal agar status "belum disimpan" tetap. */
  onSubmit: (
    formData: ArticleFormData,
    file?: File,
  ) => Promise<boolean | void> | boolean | void;
  isLoading?: boolean;
}

const MAX_TITLE = 120;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const MIN_TITLE = 10;
const MIN_WORDS = 20;

const QUILL_MODULES = { toolbar: false };

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const wordCount = (html: string) => {
  const t = stripHtml(html);
  return t ? t.split(" ").length : 0;
};

const ArticleForm: React.FC<ArticleFormProps> = ({
  article,
  onSubmit,
  isLoading = false,
}) => {
  const { state, fetchAdminCategories } = useArticles();
  const { user } = useAuth();
  const { showErrorToast } = useToastMessage();

  const author = useMemo(
    () => ({
      name: user?.full_name || user?.username || "Penulis Pena",
      avatar: user?.avatar || "/logo.png",
    }),
    [user],
  );

  const blank = useCallback(
    (): ArticleFormData => ({
      title: "",
      content: "",
      overview: "",
      coverImage: "",
      tags: [],
      publishedDate: format(new Date(), "yyyy-MM-dd"),
      featured: true,
      published: false,
      author,
      category_id: null,
    }),
    [author],
  );

  const [formData, setFormData] = useState<ArticleFormData>(blank);
  const [tagInput, setTagInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [contentError, setContentError] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [fmt, setFmt] = useState<Record<string, unknown>>({});
  const quillRef = useRef<ReactQuill>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const wasPublished = !!article?.published;

  /* ---------- load data ---------- */
  useEffect(() => {
    fetchAdminCategories();
  }, [fetchAdminCategories]);

  useEffect(() => {
    if (!article) return;
    setFormData({
      title: article.title,
      content: article.content,
      overview: article.overview || "",
      coverImage: article.coverImage || "",
      tags: article.tags || [],
      publishedDate: article.publishedDate
        ? format(new Date(article.publishedDate), "yyyy-MM-dd")
        : "",
      featured: article.featured ?? true,
      published: article.published ?? false,
      author: article.author || author,
      category_id: article.category_id ?? null,
    });
    setPreview(article.coverImage || "");
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article]);

  useEffect(
    () => () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  /* ---------- unsaved-changes guard ---------- */
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const touch = () => setDirty(true);
  const set = <K extends keyof ArticleFormData>(k: K, v: ArticleFormData[K]) => {
    setFormData((p) => ({ ...p, [k]: v }));
    touch();
  };

  /* ---------- rich text toolbar (custom, per mockup) ---------- */
  const editor = () => quillRef.current?.getEditor();

  const syncFmt = useCallback(() => {
    const q = quillRef.current?.getEditor();
    if (!q) return;
    const r = q.getSelection();
    setFmt(r ? (q.getFormat(r) as Record<string, unknown>) : {});
  }, []);

  const toggle = (name: string, value: unknown = true) => {
    const q = editor();
    if (!q) return;
    q.focus();
    const cur = q.getFormat()[name];
    q.format(name, cur === value ? false : value, "user");
    syncFmt();
  };

  const addLink = () => {
    const q = editor();
    if (!q) return;
    const range = q.getSelection(true);
    const cur = q.getFormat(range).link as string | undefined;
    const url = window.prompt("Alamat tautan (URL):", cur ?? "https://");
    if (url === null) return;
    const u = url.trim();
    if (u === "" || u === "https://") {
      q.format("link", false, "user");
      return;
    }
    if (!/^(https?:\/\/|mailto:|\/)/i.test(u)) {
      setContentError("Alamat tautan harus diawali http://, https://, atau mailto:");
      return;
    }
    setContentError("");
    if (range.length === 0) q.insertText(range.index, u, "link", u, "user");
    else q.format("link", u, "user");
  };

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      const q = editor();
      const range = q?.getSelection(true);
      const index = range?.index ?? q?.getLength() ?? 0;
      setContentError("");
      setUploadingImg(true);
      try {
        const url = await articleApi.uploadContentImage(f);
        q?.insertEmbed(index, "image", url, "user");
        q?.setSelection(index + 1, 0);
      } catch (err) {
        setContentError(
          err instanceof Error ? err.message : "Gagal mengunggah gambar",
        );
      } finally {
        setUploadingImg(false);
      }
    };
    input.click();
  };

  const tools: {
    label: string;
    icon: React.ReactNode;
    active?: boolean;
    run: () => void;
  }[] = [
    { label: "Tebal", icon: <Bold size={18} />, active: !!fmt.bold, run: () => toggle("bold") },
    { label: "Miring", icon: <Italic size={18} />, active: !!fmt.italic, run: () => toggle("italic") },
    { label: "Judul bagian", icon: <Heading2 size={18} />, active: fmt.header === 2, run: () => toggle("header", 2) },
    { label: "Daftar", icon: <List size={18} />, active: fmt.list === "bullet", run: () => toggle("list", "bullet") },
    { label: "Tautan", icon: <Link2 size={18} />, active: !!fmt.link, run: addLink },
    { label: "Sisipkan gambar", icon: <ImageIcon size={18} />, run: addImage },
    { label: "Kutipan", icon: <Quote size={18} />, active: !!fmt.blockquote, run: () => toggle("blockquote") },
  ];

  /* ---------- tags ---------- */
  const addTag = () => {
    const t = tagInput.trim().replace(/,$/, "");
    if (!t) return;
    if (!formData.tags.includes(t)) set("tags", [...formData.tags, t]);
    setTagInput("");
  };

  /* ---------- cover image ---------- */
  const pickFile = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setCoverError("Hanya file gambar yang diperbolehkan.");
      return;
    }
    if (f.size > MAX_INPUT_BYTES) {
      setCoverError("Ukuran file terlalu besar (maksimal 15 MB).");
      return;
    }
    setCoverError("");
    setOptimizing(true);
    const fitted = await fitImage(f);
    setOptimizing(false);
    setFile(fitted);
    setPreview(URL.createObjectURL(fitted));
    touch();
  };

  const removeCover = () => {
    setFile(null);
    setPreview("");
    setFormData((p) => ({ ...p, coverImage: "" }));
    if (fileRef.current) fileRef.current.value = "";
    touch();
  };

  const setCoverUrl = (v: string) => {
    setFile(null);
    setPreview(v);
    setFormData((p) => ({ ...p, coverImage: v }));
    touch();
  };

  /* ---------- submit ---------- */
  const words = wordCount(formData.content);
  const titleLen = formData.title.trim().length;
  const canPublish = titleLen >= MIN_TITLE && words >= MIN_WORDS;

  const submit = async (published: boolean) => {
    if (isLoading) return;
    if (!formData.title.trim()) return showErrorToast("Judul artikel belum diisi.");
    if (words === 0) return showErrorToast("Isi artikel belum diisi.");
    if (!file && !formData.coverImage) {
      setCoverError("Gambar sampul wajib diisi.");
      return showErrorToast("Gambar sampul wajib diisi.");
    }
    const overview =
      formData.overview.trim() || stripHtml(formData.content).slice(0, 160);
    const payload: ArticleFormData = {
      ...formData,
      title: formData.title.trim(),
      overview,
      published,
      author,
    };
    const ok = await (file ? onSubmit(payload, file) : onSubmit(payload));
    if (ok !== false) {
      setDirty(false);
      setSavedAt(new Date());
      setFormData((p) => ({ ...p, published }));
    }
  };

  const status = dirty
    ? "Perubahan belum disimpan"
    : savedAt
      ? `Tersimpan ${savedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
      : "Belum ada perubahan";

  if (state.adminCategoriesLoading && state.adminCategories.length === 0) {
    return (
      <div className="a-pg">
        <div className="a-cd">
          <div className="a-em">
            <Loader2 className="animate-spin" />
            <b>Memuat editor…</b>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="a-pg a-editor">
      <h1 className="sr-only">{article ? "Edit artikel" : "Tulis artikel baru"}</h1>
      <div className="a-hd">
        <Link
          to="/atmin/articles"
          className="a-btn a-sm"
          onClick={(e) => {
            if (dirty && !window.confirm("Perubahan belum disimpan. Tinggalkan halaman ini?"))
              e.preventDefault();
          }}
        >
          <ArrowLeft size={16} />
          Kembali ke artikel
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="a-tg" role="status">{status}</span>
          <button type="button" className="a-btn" onClick={() => setShowPreview(true)}>
            <Eye size={16} />
            Pratinjau
          </button>
          <button type="button" className="a-btn" onClick={() => submit(false)} disabled={isLoading}>
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {wasPublished ? "Jadikan Draf" : "Simpan Draf"}
          </button>
          <button
            type="button"
            className="a-btn a-p"
            onClick={() => submit(true)}
            disabled={isLoading || !canPublish}
          >
            {wasPublished ? "Perbarui" : "Terbitkan"}
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="a-mo" role="dialog" aria-modal="true" aria-labelledby="pv-t" onClick={() => setShowPreview(false)}>
          <div className="a-mc a-wide a-preview" onClick={(e) => e.stopPropagation()}>
            <div className="a-ch">
              <h2 className="a-h2" id="pv-t">Pratinjau artikel</h2>
              <button type="button" className="a-ic" aria-label="Tutup pratinjau" onClick={() => setShowPreview(false)}>
                <X size={18} />
              </button>
            </div>
            <ArticleContent
              article={{
                id: article?.id ?? "preview",
                slug: article?.slug ?? "preview",
                title: formData.title || "(Tanpa judul)",
                content: formData.content,
                overview: formData.overview,
                coverImage: preview || formData.coverImage,
                tags: formData.tags,
                publishedDate: formData.publishedDate || null,
                lastModified: new Date().toISOString(),
                featured: formData.featured,
                published: formData.published,
                author,
                readingTime: Math.max(1, Math.round(words / 200)),
                category_id: formData.category_id ?? null,
                category: state.adminCategories.find((c) => c.id === formData.category_id) ?? null,
              }}
            />
          </div>
        </div>
      )}

      <div className="a-ed">
        <section className="a-cd">
          <label className="a-lb" htmlFor="ti">Judul artikel</label>
          <input
            id="ti"
            className="a-ip a-ti"
            maxLength={MAX_TITLE}
            placeholder="Tulis judul yang jelas dan singkat"
            value={formData.title}
            onChange={(e) => set("title", e.target.value)}
            disabled={isLoading}
          />
          <div className="a-tg" style={{ marginTop: 4 }}>{formData.title.length}/{MAX_TITLE}</div>

          <label className="a-lb" htmlFor="ex">
            Ringkasan <span className="a-tg">— opsional, tampil di daftar berita</span>
          </label>
          <textarea
            id="ex"
            className="a-ip"
            rows={2}
            value={formData.overview}
            onChange={(e) => set("overview", e.target.value)}
            disabled={isLoading}
          />

          <label className="a-lb" htmlFor="bd">Isi artikel</label>
          <div className="a-rt" role="toolbar" aria-label="Format teks">
            {tools.map((t) => (
              <button
                key={t.label}
                type="button"
                title={t.label}
                aria-label={t.label}
                aria-pressed={t.active === undefined ? undefined : t.active}
                className={t.active ? "a-act" : ""}
                onMouseDown={(e) => e.preventDefault()}
                onClick={t.run}
                disabled={isLoading}
              >
                {t.icon}
              </button>
            ))}
          </div>
          <ReactQuill
            id="bd"
            ref={quillRef}
            theme="snow"
            value={formData.content}
            onChange={(c) => {
              set("content", c);
              syncFmt();
            }}
            onChangeSelection={syncFmt}
            modules={QUILL_MODULES}
            placeholder="Mulai menulis…"
            readOnly={isLoading}
          />
          <div className="a-tg" style={{ marginTop: 4 }}>
            {words} kata
            {uploadingImg && <span> · Mengunggah gambar…</span>}
          </div>
          {contentError && <p className="a-err">{contentError}</p>}
        </section>

        <aside className="a-g" style={{ alignContent: "start" }}>
          <section className="a-cd">
            <h2 className="a-h2" style={{ marginBottom: 4 }}>Pengaturan</h2>

            <label className="a-lb" htmlFor="kt">Kategori</label>
            <select
              id="kt"
              className="a-sel"
              style={{ width: "100%" }}
              value={formData.category_id ?? ""}
              onChange={(e) =>
                set("category_id", e.target.value === "" ? null : parseInt(e.target.value, 10))
              }
              disabled={isLoading}
            >
              <option value="">Tanpa kategori</option>
              {state.adminCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <label className="a-lb" htmlFor="tg">Tag</label>
            <input
              id="tg"
              className="a-ip"
              placeholder="Tekan Enter untuk menambah tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag();
                }
              }}
              disabled={isLoading}
            />
            {formData.tags.length > 0 && (
              <div className="a-chips">
                {formData.tags.map((t) => (
                  <span key={t} className="a-chip">
                    {t}
                    <button
                      type="button"
                      aria-label={`Hapus tag ${t}`}
                      onClick={() => set("tags", formData.tags.filter((x) => x !== t))}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <span className="a-lb" id="cv-l">Gambar sampul</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            {preview ? (
              <div>
                <div className="a-cover">
                  <img src={preview} alt="Pratinjau gambar sampul" />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button type="button" className="a-btn a-sm" onClick={() => fileRef.current?.click()}>
                    Ganti gambar
                  </button>
                  <button type="button" className="a-btn a-sm" onClick={removeCover}>
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                aria-labelledby="cv-l"
                className="a-dz"
                style={dragging ? { borderColor: "var(--pri)", background: "var(--ps)" } : undefined}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickFile(e.dataTransfer.files?.[0]);
                }}
                disabled={isLoading}
              >
                <ImagePlus size={20} style={{ display: "inline" }} />
                <br />
                {optimizing ? "Mengoptimalkan gambar…" : "Pilih atau seret gambar"}
                <br />
                <span className="a-tg">JPG/PNG, maks. 2 MB, rasio 16:9 disarankan</span>
              </button>
            )}
            {coverError && <p className="a-err">{coverError}</p>}

            <details style={{ marginTop: 18 }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                Opsi lanjutan
              </summary>
              <label className="a-lb" htmlFor="pd">Tanggal publikasi</label>
              <input
                id="pd"
                type="date"
                className="a-ip"
                value={formData.publishedDate || ""}
                onChange={(e) => set("publishedDate", e.target.value)}
                disabled={isLoading}
              />
              <label className="a-chk">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  disabled={isLoading}
                />
                Sematkan sebagai artikel unggulan
              </label>
              <label className="a-lb" htmlFor="cu">URL gambar sampul</label>
              <input
                id="cu"
                type="url"
                className="a-ip"
                placeholder="https://…"
                value={file ? "" : formData.coverImage}
                onChange={(e) => setCoverUrl(e.target.value)}
                disabled={isLoading || !!file}
              />
            </details>
          </section>
          <p className="a-tg">
            Tombol Terbitkan aktif setelah judul (min. {MIN_TITLE} karakter) dan isi (min. {MIN_WORDS} kata) terisi.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default ArticleForm;
