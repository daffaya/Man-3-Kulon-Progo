/**
 * @fileoverview CmsSave — penyimpanan tingkat halaman untuk editor CMS (mockup v3).
 *
 * Backend menyimpan konten per-section (PUT /atmin/cms/:page/:section). Agar halaman punya satu tombol
 * "Simpan Perubahan" seperti di mockup, setiap <SectionCard> mendaftarkan fungsi simpannya ke provider
 * ini dan melaporkan status "dirty". saveAll() menjalankan hanya section yang berubah, berurutan.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { CMS_PUBLIC_PATH } from "../../pages/admin/cms/cmsPages";

type SaveFn = () => Promise<void>;
type Status = "idle" | "saved" | "error";

interface CmsSaveCtx {
  register: (id: string, save: SaveFn) => void;
  unregister: (id: string) => void;
  setDirty: (id: string, dirty: boolean) => void;
  setHeaderMounted: (mounted: boolean) => void;
  headerMounted: boolean;
  dirtyCount: number;
  saving: boolean;
  status: Status;
  failed: number;
  savedAt: Date | null;
  saveAll: () => Promise<void>;
}

const Ctx = createContext<CmsSaveCtx | null>(null);

export const useCmsSave = () => useContext(Ctx);

export const CmsSaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const regs = useRef(new Map<string, SaveFn>());
  const [dirty, setDirtyIds] = useState<Set<string>>(new Set());
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [failed, setFailed] = useState(0);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [headerMounted, setHeaderMounted] = useState(false);

  const register = useCallback((id: string, save: SaveFn) => {
    regs.current.set(id, save);
  }, []);
  const unregister = useCallback((id: string) => {
    regs.current.delete(id);
    setDirtyIds((s) => {
      if (!s.has(id)) return s;
      const n = new Set(s);
      n.delete(id);
      return n;
    });
  }, []);
  const setDirty = useCallback((id: string, d: boolean) => {
    setDirtyIds((s) => {
      if (s.has(id) === d) return s;
      const n = new Set(s);
      if (d) n.add(id);
      else n.delete(id);
      return n;
    });
    if (d) setStatus("idle");
  }, []);

  const saveAll = useCallback(async () => {
    const ids = [...dirtyRef.current];
    if (ids.length === 0) return;
    setSaving(true);
    let fail = 0;
    for (const id of ids) {
      const fn = regs.current.get(id);
      if (!fn) continue;
      try {
        await fn();
      } catch {
        fail += 1;
      }
    }
    setFailed(fail);
    setStatus(fail > 0 ? "error" : "saved");
    setSavedAt(new Date());
    setSaving(false);
  }, []);

  useEffect(() => {
    if (dirty.size === 0) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty.size]);

  const value = useMemo<CmsSaveCtx>(
    () => ({
      register,
      unregister,
      setDirty,
      setHeaderMounted,
      headerMounted,
      dirtyCount: dirty.size,
      saving,
      status,
      failed,
      savedAt,
      saveAll,
    }),
    [register, unregister, setDirty, headerMounted, dirty.size, saving, status, failed, savedAt, saveAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

/** Status + tautan "Lihat halaman" + tombol "Simpan Perubahan". */
export const CmsSaveBar: React.FC = () => {
  const ctx = useCmsSave();
  const { pathname } = useLocation();
  if (!ctx) return null;

  const pub = CMS_PUBLIC_PATH[pathname.replace(/\/$/, "")];
  const text = ctx.saving
    ? "Menyimpan…"
    : ctx.status === "error" && ctx.failed > 0
      ? `${ctx.failed} bagian gagal disimpan`
      : ctx.dirtyCount > 0
        ? "Perubahan belum disimpan"
        : ctx.status === "saved" && ctx.savedAt
          ? `Tersimpan ${ctx.savedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
          : "Belum ada perubahan";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span className="a-tg" role="status" aria-live="polite">{text}</span>
      {pub && (
        <a className="a-btn" href={pub} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={16} />
          Lihat halaman
        </a>
      )}
      <button
        type="button"
        className="a-btn a-p"
        onClick={ctx.saveAll}
        disabled={ctx.saving || ctx.dirtyCount === 0}
      >
        {ctx.saving && <Loader2 size={16} className="animate-spin" />}
        Simpan Perubahan
      </button>
    </div>
  );
};

export const CmsBackLink: React.FC = () => {
  const ctx = useCmsSave();
  return (
    <Link
      to="/atmin/cms"
      className="a-btn a-sm"
      style={{ marginBottom: 10 }}
      onClick={(e) => {
        if (ctx && ctx.dirtyCount > 0 && !window.confirm("Perubahan belum disimpan. Tinggalkan halaman ini?"))
          e.preventDefault();
      }}
    >
      <ArrowLeft size={16} />
      Halaman Website
    </Link>
  );
};

/** Dipakai CmsPageHeader agar CmsLayout tahu header sudah dirender (tanpa header cadangan). */
export const useMarkHeaderMounted = () => {
  const ctx = useCmsSave();
  const set = ctx?.setHeaderMounted;
  useLayoutEffect(() => {
    set?.(true);
    return () => set?.(false);
  }, [set]);
};
