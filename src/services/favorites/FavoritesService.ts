/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IFavoritesService {
  getFavoriteIds(userId?: string): string[];
  isFavorite(offerId: string, userId?: string): boolean;
  toggleFavorite(offerId: string, userId?: string): boolean;
  addFavorite(offerId: string, userId?: string): void;
  removeFavorite(offerId: string, userId?: string): void;
  subscribe(callback: (favoriteIds: string[]) => void): () => void;
}

export interface IStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORAGE_KEY_PREFIX = 'nearby_offers_favorites_';

export class LocalStorageFavoritesService implements IFavoritesService {
  private listeners: Array<(favoriteIds: string[]) => void> = [];
  private memoryFallback: Map<string, string> = new Map();
  private storageAdapter?: IStorageAdapter;

  constructor(customStorage?: IStorageAdapter) {
    if (customStorage) {
      this.storageAdapter = customStorage;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      this.storageAdapter = window.localStorage;
    }
  }

  private getKey(userId?: string): string {
    return `${STORAGE_KEY_PREFIX}${userId || 'local_user'}`;
  }

  getFavoriteIds(userId?: string): string[] {
    const key = this.getKey(userId);
    try {
      let raw: string | null = null;
      if (this.storageAdapter) {
        raw = this.storageAdapter.getItem(key);
      } else {
        raw = this.memoryFallback.get(key) || null;
      }

      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  isFavorite(offerId: string, userId?: string): boolean {
    const list = this.getFavoriteIds(userId);
    return list.includes(offerId);
  }

  toggleFavorite(offerId: string, userId?: string): boolean {
    const current = this.getFavoriteIds(userId);
    const exists = current.includes(offerId);

    let updated: string[];
    if (exists) {
      updated = current.filter((id) => id !== offerId);
    } else {
      updated = [...current, offerId];
    }

    this.save(updated, userId);
    return !exists;
  }

  addFavorite(offerId: string, userId?: string): void {
    const current = this.getFavoriteIds(userId);
    if (!current.includes(offerId)) {
      this.save([...current, offerId], userId);
    }
  }

  removeFavorite(offerId: string, userId?: string): void {
    const current = this.getFavoriteIds(userId);
    if (current.includes(offerId)) {
      this.save(
        current.filter((id) => id !== offerId),
        userId
      );
    }
  }

  private save(ids: string[], userId?: string): void {
    const key = this.getKey(userId);
    const value = JSON.stringify(ids);

    try {
      if (this.storageAdapter) {
        this.storageAdapter.setItem(key, value);
      } else {
        this.memoryFallback.set(key, value);
      }
    } catch {
      this.memoryFallback.set(key, value);
    }

    this.notify(ids);
  }

  private notify(ids: string[]): void {
    for (const listener of this.listeners) {
      listener(ids);
    }
  }

  subscribe(callback: (favoriteIds: string[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }
}

export const favoritesService = new LocalStorageFavoritesService();
