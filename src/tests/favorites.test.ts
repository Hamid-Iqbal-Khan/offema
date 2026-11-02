/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  LocalStorageFavoritesService,
  IStorageAdapter,
} from '../services/favorites/FavoritesService';

class MockStorage implements IStorageAdapter {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe('FavoritesService (Save to Favorites)', () => {
  let mockStorage: MockStorage;
  let service: LocalStorageFavoritesService;

  beforeEach(() => {
    mockStorage = new MockStorage();
    service = new LocalStorageFavoritesService(mockStorage);
  });

  it('starts with an empty favorites list', () => {
    expect(service.getFavoriteIds('user-1')).toEqual([]);
    expect(service.isFavorite('offer-1', 'user-1')).toBe(false);
  });

  it('adds an offer to favorites', () => {
    service.addFavorite('offer-1', 'user-1');
    expect(service.isFavorite('offer-1', 'user-1')).toBe(true);
    expect(service.getFavoriteIds('user-1')).toEqual(['offer-1']);
  });

  it('toggles favorites on and off correctly', () => {
    // Toggle on
    const added = service.toggleFavorite('offer-1', 'user-1');
    expect(added).toBe(true);
    expect(service.isFavorite('offer-1', 'user-1')).toBe(true);

    // Toggle off
    const removed = service.toggleFavorite('offer-1', 'user-1');
    expect(removed).toBe(false);
    expect(service.isFavorite('offer-1', 'user-1')).toBe(false);
    expect(service.getFavoriteIds('user-1')).toEqual([]);
  });

  it('isolates favorites between different users', () => {
    service.addFavorite('offer-1', 'user-alice');
    service.addFavorite('offer-2', 'user-bob');

    expect(service.getFavoriteIds('user-alice')).toEqual(['offer-1']);
    expect(service.getFavoriteIds('user-bob')).toEqual(['offer-2']);
    expect(service.isFavorite('offer-1', 'user-bob')).toBe(false);
  });

  it('notifies subscribers when favorites change', () => {
    let captured: string[] = [];
    const unsubscribe = service.subscribe((ids) => {
      captured = ids;
    });

    service.addFavorite('offer-42', 'user-1');
    expect(captured).toContain('offer-42');

    service.removeFavorite('offer-42', 'user-1');
    expect(captured).not.toContain('offer-42');

    unsubscribe();
  });
});
