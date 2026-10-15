/**
 * @fileoverview React.lazy wrapper that survives a deploy while a tab is open.
 *
 * Each deploy replaces the hashed chunk files, so an old tab that lazy-loads a
 * page afterwards gets a 404/HTML response and the import() rejects. Reload once
 * (guarded by sessionStorage so it can never loop) to pick up the new build.
 */
import { lazy } from "react";
import type { ComponentType } from "react";

const RELOAD_KEY = "chunk-reload-at";
const RELOAD_COOLDOWN_MS = 10_000;

export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        /* storage unavailable */
      }
      return mod;
    } catch (err) {
      let last = 0;
      try {
        last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      } catch {
        /* storage unavailable */
      }
      if (Date.now() - last > RELOAD_COOLDOWN_MS) {
        try {
          sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        } catch {
          /* storage unavailable */
        }
        window.location.reload();
        // Never resolves: the page is reloading.
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}
