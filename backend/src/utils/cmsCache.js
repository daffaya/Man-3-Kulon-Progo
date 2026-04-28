/**
 * @fileoverview Simple in-memory cache for CMS data.
 * Avoids hitting the database on every request for rarely-changing content.
 * TTL default: 5 minutes. Cache is invalidated per-key on every admin write.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Creates a simple in-memory cache instance.
 * @param {number} [ttlMs] - Time-to-live in milliseconds.
 * @returns {object} Cache methods: get, set, invalidate, invalidatePrefix.
 */
const createCache = (ttlMs = DEFAULT_TTL_MS) => {
  /** @type {Map<string, { value: any, expiresAt: number }>} */
  const store = new Map();

  return {
    /**
     * Get a cached value. Returns null if missing or expired.
     * @param {string} key
     * @returns {any|null}
     */
    get(key) {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },

    /**
     * Set a value in cache.
     * @param {string} key
     * @param {any} value
     */
    set(key, value) {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    },

    /**
     * Manually invalidate a specific key (call after admin writes).
     * @param {string} key
     */
    invalidate(key) {
      store.delete(key);
    },

    /**
     * Invalidate all keys that start with a given prefix.
     * Useful for invalidating an entire page's cache after any section update.
     * @param {string} prefix
     */
    invalidatePrefix(prefix) {
      for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
      }
    },

    /** Clear entire cache (for testing / emergency). */
    flush() {
      store.clear();
    },
  };
};

// Singleton — shared across the whole app process
const cmsCache = createCache();

export default cmsCache;
