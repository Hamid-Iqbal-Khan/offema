/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  addRecentlyViewed,
  getRecentlyViewedIds,
  clearRecentlyViewed,
  MAX_RECENTLY_VIEWED,
  KeyValueStorage,
} from '../services/history/RecentlyViewedService';

class MemoryStorage implements KeyValueStorage {
  private map = new Map<string, string>();
  getItem(key: string) {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

describe('RecentlyViewedService', () => {
  let storage: MemoryStorage;
  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('returns newest first and de-duplicates', () => {
    addRecentlyViewed('a', 'u1', storage);
    addRecentlyViewed('b', 'u1', storage);
    addRecentlyViewed('a', 'u1', storage);
    expect(getRecentlyViewedIds('u1', storage)).toEqual(['a', 'b']);
  });

  it('caps history length', () => {
    for (let i = 0; i < MAX_RECENTLY_VIEWED + 5; i++) addRecentlyViewed(`o${i}`, 'u1', storage);
    const ids = getRecentlyViewedIds('u1', storage);
    expect(ids).toHaveLength(MAX_RECENTLY_VIEWED);
    expect(ids[0]).toBe(`o${MAX_RECENTLY_VIEWED + 4}`);
  });

  it('keeps users separate and tolerates corrupt data', () => {
    addRecentlyViewed('a', 'u1', storage);
    expect(getRecentlyViewedIds('u2', storage)).toEqual([]);
    storage.setItem('offema_recently_viewed_u3', '{not json');
    expect(getRecentlyViewedIds('u3', storage)).toEqual([]);
  });

  it('clears history', () => {
    addRecentlyViewed('a', 'u1', storage);
    clearRecentlyViewed('u1', storage);
    expect(getRecentlyViewedIds('u1', storage)).toEqual([]);
  });
});
