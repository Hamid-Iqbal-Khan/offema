/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { sortOffers } from '../domain/logic/sortOffers';
import { OfferWithDistance } from '../domain/models/Offer';

const MOCK_ITEMS: OfferWithDistance[] = [
  {
    id: 'a',
    title: 'Alpha 20% Off',
    providerId: 'p1',
    providerName: 'Merchant A',
    description: '',
    categoryId: 'c1',
    categoryName: 'Cat 1',
    valueType: 'PERCENTAGE',
    value: 20,
    scope: 'LOCAL',
    distanceKm: 3.5,
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    termsAndConditions: [],
    imageUrls: [],
    isActive: true,
  },
  {
    id: 'b',
    title: 'Beta 50% Off',
    providerId: 'p2',
    providerName: 'Merchant B',
    description: '',
    categoryId: 'c1',
    categoryName: 'Cat 1',
    valueType: 'PERCENTAGE',
    value: 50,
    scope: 'LOCAL',
    distanceKm: 4.0,
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    termsAndConditions: [],
    imageUrls: [],
    isActive: true,
  },
  {
    id: 'c',
    title: 'Charlie 50% Off Closer',
    providerId: 'p3',
    providerName: 'Merchant C',
    description: '',
    categoryId: 'c1',
    categoryName: 'Cat 1',
    valueType: 'PERCENTAGE',
    value: 50,
    scope: 'LOCAL',
    distanceKm: 1.2, // Closer than Beta (4.0km), tests tie-breaker!
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    termsAndConditions: [],
    imageUrls: [],
    isActive: true,
  },
  {
    id: 'd',
    title: 'Delta ₹1,000 Off Flat',
    providerId: 'p4',
    providerName: 'Merchant D',
    description: '',
    categoryId: 'c2',
    categoryName: 'Cat 2',
    valueType: 'FIXED_AMOUNT',
    value: 1000,
    scope: 'LOCAL',
    distanceKm: 2.0,
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    termsAndConditions: [],
    imageUrls: [],
    isActive: true,
  },
];

describe('Offer Sorting Logic', () => {
  it('defaults to HIGHEST_OFFER with deterministic tie-breaking (nearer first)', () => {
    const sorted = sortOffers(MOCK_ITEMS, 'HIGHEST_OFFER');

    // Both Charlie and Beta have 50% off, but Charlie is closer (1.2 km vs 4.0 km)
    expect(sorted[0].id).toBe('c'); // Charlie 50% (1.2km)
    expect(sorted[1].id).toBe('b'); // Beta 50% (4.0km)
    expect(sorted[2].id).toBe('a'); // Alpha 20%
  });

  it('sorts correctly with NEAREST preference', () => {
    const sorted = sortOffers(MOCK_ITEMS, 'NEAREST');

    // Expected order of distances: 1.2km (c), 2.0km (d), 3.5km (a), 4.0km (b)
    expect(sorted[0].id).toBe('c');
    expect(sorted[1].id).toBe('d');
    expect(sorted[2].id).toBe('a');
    expect(sorted[3].id).toBe('b');
  });

  it('respects explicit rankingScore when comparing mixed offer types', () => {
    const scoredItems: OfferWithDistance[] = [
      {
        ...MOCK_ITEMS[0],
        id: 'pct-scored',
        valueType: 'PERCENTAGE',
        value: 15,
        rankingScore: 60,
      },
      {
        ...MOCK_ITEMS[3],
        id: 'fixed-scored',
        valueType: 'FIXED_AMOUNT',
        value: 2000,
        rankingScore: 95,
      },
    ];

    const sorted = sortOffers(scoredItems, 'HIGHEST_OFFER');
    expect(sorted[0].id).toBe('fixed-scored');
    expect(sorted[1].id).toBe('pct-scored');
  });

  it('does not mutate the original input array', () => {
    const original = [...MOCK_ITEMS];
    sortOffers(MOCK_ITEMS, 'HIGHEST_OFFER');
    expect(MOCK_ITEMS).toEqual(original);
  });
});
