/**
 * @fileoverview useAdminSummary — ringkasan artikel untuk dashboard admin, badge sidebar
 * dan notifikasi. Hasil di-cache di level modul (60 detik) supaya berpindah halaman admin
 * tidak memicu request berulang. Panggil invalidateAdminSummary() setelah artikel berubah.
 */
import { useEffect, useState } from "react";
import articleApi from "../api/articleApi";
import { useAuth } from "../contexts/AuthContext";
import type { Article } from "../types/articleTypes";

export interface MiniArticle {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  category: string | null;
  publishedDate: string | null;
  lastModified: string | null;
  published: boolean;
}

export interface AdminSummary {
  enabled: boolean;
  loading: boolean;
  error: boolean;
  total: number;
  drafts: number;
  publishedThisMonth: number;
  publishedLastMonth: number;
  lastPublishedDate: string | null;
  draftList: MiniArticle[];
  latestPublished: MiniArticle[];
}

const TTL = 60_000;
const EMPTY: AdminSummary = {
  enabled: false,
  loading: false,
  error: false,
  total: 0,
  drafts: 0,
  publishedThisMonth: 0,
  publishedLastMonth: 0,
  lastPublishedDate: null,
  draftList: [],
  latestPublished: [],
};

let cache: { at: number; data: AdminSummary } | null = null;
let inflight: Promise<AdminSummary> | null = null;

export const invalidateAdminSummary = () => {
  cache = null;
};

const toMini = (a: Article): MiniArticle => ({
  id: a.id,
  slug: a.slug,
  title: a.title,
  coverImage: a.coverImage,
  category: a.category?.name ?? null,
  publishedDate: a.publishedDate,
  lastModified: a.lastModified ?? null,
  published: a.published,
});

const time = (d: string | null) => (d ? new Date(d).getTime() || 0 : 0);

const PAGE = 50;
const MAX_PAGES = 10;

/** Ambil semua halaman hasil (maks. MAX_PAGES) agar hitungan bulanan akurat. */
const fetchAll = async (published: boolean): Promise<{ articles: Article[]; total: number }> => {
  const first = await articleApi.getAdminArticles({ published, limit: PAGE, page: 1 });
  const totalPages = Math.min(first.totalPages ?? 1, MAX_PAGES);
  const rest = await Promise.all(
    Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) =>
      articleApi.getAdminArticles({ published, limit: PAGE, page: i + 2 }),
    ),
  );
  return {
    articles: [first, ...rest].flatMap((r) => r.articles),
    total: first.totalArticles ?? first.articles.length,
  };
};

const load = async (): Promise<AdminSummary> => {
  const [drafts, published] = await Promise.all([fetchAll(false), fetchAll(true)]);

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const last = new Date(y, m - 1, 1);

  const pub = [...published.articles].sort(
    (a, b) => time(b.publishedDate) - time(a.publishedDate),
  );
  const inMonth = (a: Article, yy: number, mm: number) => {
    if (!a.publishedDate) return false;
    const d = new Date(a.publishedDate);
    return d.getFullYear() === yy && d.getMonth() === mm;
  };

  return {
    enabled: true,
    loading: false,
    error: false,
    total: drafts.total + published.total,
    drafts: drafts.total,
    publishedThisMonth: pub.filter((a) => inMonth(a, y, m)).length,
    publishedLastMonth: pub.filter((a) =>
      inMonth(a, last.getFullYear(), last.getMonth()),
    ).length,
    lastPublishedDate: pub[0]?.publishedDate ?? null,
    draftList: [...drafts.articles]
      .sort((a, b) => time(b.lastModified) - time(a.lastModified))
      .slice(0, 5)
      .map(toMini),
    latestPublished: pub.slice(0, 4).map(toMini),
  };
};

/** Role yang boleh mengelola artikel (mirror backend). */
export const ARTICLE_ROLES = ["jurnalis", "super_admin"];

export const useAdminSummary = (): AdminSummary => {
  const { user, isLoggedIn } = useAuth();
  const canArticles = !!user && ARTICLE_ROLES.includes(user.role);
  const [summary, setSummary] = useState<AdminSummary>(
    cache && Date.now() - cache.at < TTL
      ? cache.data
      : { ...EMPTY, enabled: canArticles, loading: canArticles },
  );

  useEffect(() => {
    if (!isLoggedIn || !canArticles) {
      setSummary(EMPTY);
      return;
    }
    if (cache && Date.now() - cache.at < TTL) {
      setSummary(cache.data);
      return;
    }
    let alive = true;
    setSummary((s) => ({ ...s, enabled: true, loading: true, error: false }));
    inflight =
      inflight ??
      load().finally(() => {
        inflight = null;
      });
    inflight
      .then((data) => {
        cache = { at: Date.now(), data };
        if (alive) setSummary(data);
      })
      .catch(() => {
        if (alive)
          setSummary((s) => ({ ...s, enabled: true, loading: false, error: true }));
      });
    return () => {
      alive = false;
    };
  }, [isLoggedIn, canArticles]);

  return summary;
};

/** Format tanggal ringkas untuk UI admin, mis. "21 Sep 2026". */
export const shortDate = (d: string | null | undefined): string => {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** "hari ini", "kemarin", "N hari lalu", atau tanggal ringkas. */
export const relativeDay = (d: string | null | undefined): string => {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  const days = Math.floor((Date.now() - dt.getTime()) / 86_400_000);
  if (days <= 0) return "hari ini";
  if (days === 1) return "kemarin";
  if (days < 7) return `${days} hari lalu`;
  return shortDate(d);
};
