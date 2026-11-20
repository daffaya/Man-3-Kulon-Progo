/**
 * @fileoverview Lightweight in-memory tracker for failed login attempts,
 * so repeated failures against one specific account are throttled even
 * from many different IPs (AUDIT-005's rate limiter alone is per-IP, so a
 * distributed attacker could still brute-force one account without ever
 * tripping it). (AUDIT-018)
 *
 * Deliberately in-memory, not persisted to the DB: this is a small
 * single-instance deployment (see deployment-context.md), and a lockout
 * that resets on a server restart is an acceptable trade-off here — it
 * avoids adding a schema migration for a LOW-severity hardening feature.
 *
 * Deliberately time-limited (not permanent): a small school site has no
 * separate "unlock this account" admin flow, so a permanent lockout could
 * catastrophically lock out the only super_admin with no way back in.
 * Combined with AUDIT-005's per-IP rate limit, a bounded, auto-expiring
 * lockout is the safer trade-off the report's own risk note asks for.
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/** @type {Map<string, { count: number, lockedUntil: number | null }>} */
const attempts = new Map();

const keyFor = (username) => String(username).trim().toLowerCase();

/**
 * @param {string} username
 * @returns {{ locked: boolean, retryAfterSeconds?: number }}
 */
export const checkLockout = (username) => {
  const entry = attempts.get(keyFor(username));
  if (!entry?.lockedUntil) return { locked: false };

  const now = Date.now();
  if (now >= entry.lockedUntil) {
    attempts.delete(keyFor(username)); // lockout window elapsed — clear it
    return { locked: false };
  }

  return {
    locked: true,
    retryAfterSeconds: Math.ceil((entry.lockedUntil - now) / 1000),
  };
};

/** Call after a failed login attempt for this username. */
export const recordFailedAttempt = (username) => {
  const key = keyFor(username);
  const entry = attempts.get(key) || { count: 0, lockedUntil: null };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
  attempts.set(key, entry);
};

/** Call after a successful login for this username. */
export const clearFailedAttempts = (username) => {
  attempts.delete(keyFor(username));
};
