/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Remembers the offers a user opened most recently (per user, newest first),
 * so the home feed can offer a quick "Pick up where you left off" rail.
 * Storage failures (private mode, quota) are swallowed: the feature simply stays empty.
 */

const STORAGE_KEY_PREFIX = 'offema_recently_viewed_';
export const MAX_RECENTLY_VIEWED = 8;

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const keyFor = (uid?: string) => `${STORAGE_KEY_PREFIX}${uid || 'guest'}`;

const defaultStorage = (): KeyValueStorage | null => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
};

export function getRecentlyViewedIds(uid?: string, storage = defaultStorage()): string[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(keyFor(uid));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(offerId: string, uid?: string, storage = defaultStorage()): string[] {
  const next = [offerId, ...getRecentlyViewedIds(uid, storage).filter((id) => id !== offerId)].slice(
    0,
    MAX_RECENTLY_VIEWED
  );
  if (storage) {
    try {
      storage.setItem(keyFor(uid), JSON.stringify(next));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }
  return next;
}

export function clearRecentlyViewed(uid?: string, storage = defaultStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(keyFor(uid), '[]');
  } catch {
    // ignore
  }
}
