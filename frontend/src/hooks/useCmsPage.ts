// src/hooks/useCmsPage.ts

/**
 * @fileoverview Custom hook for fetching CMS content.
 * Provides typed data fetching for both full pages and individual sections,
 * with loading state, error handling, and safe fallback values.
 */

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../lib/api";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface CmsState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ─────────────────────────────────────────────
// Hook: useCmsPage
// ─────────────────────────────────────────────

/**
 * Fetch all sections for a given CMS page.
 * Returns an object keyed by section name.
 *
 * @example
 * const { data, loading } = useCmsPage('home');
 * const title = data?.about?.title ?? 'MAN 3 Kulon Progo';
 */
export const useCmsPage = <T extends Record<string, any>>(page: string) => {
  const [state, setState] = useState<CmsState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // Prevent state update on unmounted component
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setState({ data: null, loading: true, error: null });

    apiFetch<T>(`/cms/${page}`)
      .then((data) => {
        if (mountedRef.current) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (mountedRef.current) {
          setState({ data: null, loading: false, error: err.message });
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, [page]);

  return state;
};

// ─────────────────────────────────────────────
// Hook: useCmsSection
// ─────────────────────────────────────────────

/**
 * Fetch a single section from a CMS page.
 * Useful when a component only needs one section.
 *
 * @example
 * const { data, loading } = useCmsSection('home', 'stats');
 * const guru = data?.guru ?? '50';
 */
export const useCmsSection = <T extends Record<string, any>>(
  page: string,
  section: string,
) => {
  const [state, setState] = useState<CmsState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setState({ data: null, loading: true, error: null });

    apiFetch<T>(`/cms/${page}/${section}`)
      .then((data) => {
        if (mountedRef.current) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (mountedRef.current) {
          setState({ data: null, loading: false, error: err.message });
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, [page, section]);

  return state;
};

// ─────────────────────────────────────────────
// Hook: useCmsCollection
// ─────────────────────────────────────────────

/**
 * Fetch a CMS collection (slider, quick_actions, dll.)
 * Returns an array of items ordered by sort_order.
 *
 * @example
 * const { data, loading } = useCmsCollection('slider');
 * const slides = data ?? [];
 */
export const useCmsCollection = <T extends Record<string, any>>(
  type: string,
) => {
  const [state, setState] = useState<CmsState<T[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setState({ data: null, loading: true, error: null });

    apiFetch<T[]>(`/cms/collections/${type}`)
      .then((data) => {
        if (mountedRef.current) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (mountedRef.current) {
          setState({ data: null, loading: false, error: err.message });
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, [type]);

  return state;
};
