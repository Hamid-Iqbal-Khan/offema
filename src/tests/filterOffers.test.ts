/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { filterOffers } from '../domain/logic/filterOffers';
import { OfferWithDistance } from '../domain/models/Offer';

const MOCK_OFFERS: OfferWithDistance[] = [
  {
    id: '1',
    title: '30% Off Artisanal Coffee',
    providerId: 'p1',
    providerName: 'Roastery House',
    description: 'Fresh coffee and pastries',
    categoryId: 'food-dining',
    categoryName: 'Food & Dining',
    valueType: 'PERCENTAGE',
    value: 30,
    scope: 'LOCAL',
    distanceKm: 0.8,
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    termsAndConditions: [],
    imageUrls: [],
    isActive: true,
  },
  {
    id: '2',
    title: '₹250 Off Groceries',
    providerId: 'p2',
    providerName: 'Ratnadeep Supermarket',
    description: 'Fresh vegetables and staples',
    categoryId: 'grocery',
    categoryName: 'Grocery & Essentials',
    valueType: 'FIXED_AMOUNT',
    value: 250,
    scope: 'LOCAL',
    distanceKm: 2.3,
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    termsAndConditions: [],
    imageUrls: [],
    isActive: true,
  },
  {
    id: '3',
    title: '40% Off Handloom Kurta',
    providerId: 'p3',
    providerName: 'Fabindia Jubilee',
    description: 'Ethnic linen clothing',
    categoryId: 'fashion',
    categoryName: 'Fashion & Apparel',
    valueType: 'PERCENTAGE',
    value: 40,
    scope: 'LOCAL',
    distanceKm: 7.5, // > 5 km away
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    termsAndConditions: [],
    imageUrls: [],
    isActive: true,
  },
  {
    id: '4',
    title: '50% Off Online Athleisure',
    providerId: 'p4',
    providerName: 'Myntra Fashion',
    description: 'Nationwide online fashion store',
    categoryId: 'fashion',
    categoryName: 'Fashion & Apparel',
    valueType: 'PERCENTAGE',
    value: 50,
    scope: 'ONLINE',
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    termsAndConditions: [],
    imageUrls: [],
    isActive: true,
  },
  {
    id: '5',
    title: 'Expired Monsoon Offer',
    providerId: 'p5',
    providerName: 'Monsoon Retail',
    description: 'Expired offer',
    categoryId: 'fashion',
    categoryName: 'Fashion & Apparel',
    valueType: 'PERCENTAGE',
    value: 60,
    scope: 'LOCAL',
    distanceKm: 1.0,
    validFrom: '2025-01-01T00:00:00.000Z',
    validUntil: '2025-12-31T23:59:59.000Z', // Expired
    termsAndConditions: [],
    imageUrls: [],
    isActive: true,
  },
];

const REF_DATE = new Date('2026-10-15T12:00:00.000Z');

describe('Offer Filtering Logic', () => {
  it('automatically excludes expired offers', () => {
    const results = filterOffers(MOCK_OFFERS, { scopeFilter: 'ALL' }, REF_DATE);
    const expiredFound = results.some((o) => o.id === '5');
    expect(expiredFound).toBe(false);
    expect(results.length).toBe(4);
  });

  it('filters by scope (LOCAL vs GLOBAL)', () => {
    const localResults = filterOffers(MOCK_OFFERS, { scopeFilter: 'LOCAL' }, REF_DATE);
    expect(localResults.every((o) => o.scope === 'LOCAL')).toBe(true);
    expect(localResults.length).toBe(3); // items 1, 2, 3

    const globalResults = filterOffers(MOCK_OFFERS, { scopeFilter: 'GLOBAL' }, REF_DATE);
    expect(globalResults.every((o) => o.scope !== 'LOCAL')).toBe(true);
    expect(globalResults.length).toBe(1); // item 4
  });

  it('filters by keyword search across title, merchant, and description', () => {
    const coffeeSearch = filterOffers(
      MOCK_OFFERS,
      { keyword: 'coffee', scopeFilter: 'ALL' },
      REF_DATE
    );
    expect(coffeeSearch.length).toBe(1);
    expect(coffeeSearch[0].id).toBe('1');

    const merchantSearch = filterOffers(
      MOCK_OFFERS,
      { keyword: 'Ratnadeep', scopeFilter: 'ALL' },
      REF_DATE
    );
    expect(merchantSearch.length).toBe(1);
    expect(merchantSearch[0].id).toBe('2');
  });

  it('filters by distance radius (default 5 km vs 10 km)', () => {
    // Within default 5 km
    const within5km = filterOffers(
      MOCK_OFFERS,
      { scopeFilter: 'LOCAL', maxDistanceKm: 5 },
      REF_DATE
    );
    expect(within5km.length).toBe(2); // items 1 (0.8km) and 2 (2.3km); item 3 (7.5km) excluded
    expect(within5km.some((o) => o.id === '3')).toBe(false);

    // Expanding to 10 km includes item 3
    const within10km = filterOffers(
      MOCK_OFFERS,
      { scopeFilter: 'LOCAL', maxDistanceKm: 10 },
      REF_DATE
    );
    expect(within10km.length).toBe(3);
    expect(within10km.some((o) => o.id === '3')).toBe(true);
  });

  it('combines multiple filters using strict AND logic', () => {
    // Category = 'fashion' AND scope = 'LOCAL' AND maxDistanceKm = 5
    // Item 3 is fashion + LOCAL, but 7.5km > 5km -> should yield 0
    const results = filterOffers(
      MOCK_OFFERS,
      {
        scopeFilter: 'LOCAL',
        categoryIds: ['fashion'],
        maxDistanceKm: 5,
      },
      REF_DATE
    );
    expect(results.length).toBe(0);

    // Now expanding radius to 10km should match item 3
    const expanded = filterOffers(
      MOCK_OFFERS,
      {
        scopeFilter: 'LOCAL',
        categoryIds: ['fashion'],
        maxDistanceKm: 10,
      },
      REF_DATE
    );
    expect(expanded.length).toBe(1);
    expect(expanded[0].id).toBe('3');
  });

  it('does not mutate the original input array', () => {
    const copy = [...MOCK_OFFERS];
    filterOffers(MOCK_OFFERS, { keyword: 'xyz', scopeFilter: 'LOCAL' }, REF_DATE);
    expect(MOCK_OFFERS).toEqual(copy);
  });
});
