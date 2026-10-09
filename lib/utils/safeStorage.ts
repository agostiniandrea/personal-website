/* ---------------------------------------------------------------------------
 * Browser storage that never throws
 *
 * `localStorage` and `sessionStorage` are not guaranteed: they throw when a
 * browser blocks site data, in some private modes and in some embedded
 * browsers, and merely touching `window.localStorage` can throw too. Here a
 * failed read is "nothing stored" and a failed write is reported through the
 * return value, never thrown, so a convenience (a remembered dismissal, a
 * "feedback sent" flag) can never break the thing the visitor is actually
 * doing.
 *
 * Use it for state that is nice to remember. State that must survive (there is
 * none today) would need a different answer than silently dropping the write.
 * ------------------------------------------------------------------------- */

export interface SafeStorage {
  /** The stored value, or null when absent or when storage is unavailable. */
  getItem(key: string): string | null;
  /** Whether the value was actually stored. */
  setItem(key: string, value: string): boolean;
}

const createSafeStorage = (area: () => Storage): SafeStorage => ({
  getItem(key) {
    try {
      return area().getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      area().setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
});

export const safeLocalStorage = createSafeStorage(() => window.localStorage);
export const safeSessionStorage = createSafeStorage(
  () => window.sessionStorage,
);
