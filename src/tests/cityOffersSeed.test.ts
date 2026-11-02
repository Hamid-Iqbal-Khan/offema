/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  generateCitySampleOffers,
  CITY_SAMPLE_OFFERS,
  CITY_LOCALITIES,
} from '../services/offers/cityOffersSeed';
import { INITIAL_CATEGORIES } from '../config/categories';
import { isOfferActiveAndValid } from '../domain/logic/offerValidity';
import { calculateHaversineDistanceKm } from '../domain/logic/distance';

const BOUNDS = {
  BLR: { lat: [12.8, 13.15], lng: [77.45, 77.8] },
  HYD: { lat: [17.3, 17.55], lng: [78.25, 78.6] },
} as const;

describe('City sample offers catalogue', () => {
  it('has 100 offers per city (200 total) with unique ids', () => {
    expect(generateCitySampleOffers('BLR')).toHaveLength(100);
    expect(generateCitySampleOffers('HYD')).toHaveLength(100);
    expect(CITY_SAMPLE_OFFERS).toHaveLength(200);
    expect(new Set(CITY_SAMPLE_OFFERS.map((o) => o.id)).size).toBe(200);
  });

  it.each(['BLR', 'HYD'] as const)('%s covers every category and every locality, inside city bounds', (city) => {
    const offers = generateCitySampleOffers(city);
    const categoryIds = new Set(offers.map((o) => o.categoryId));
    INITIAL_CATEGORIES.forEach((c) => expect(categoryIds.has(c.id)).toBe(true));

    const labels = offers.map((o) => o.location!.label);
    CITY_LOCALITIES[city].forEach((loc) => {
      expect(labels.filter((l) => l.endsWith(loc.name)).length).toBeGreaterThanOrEqual(4);
    });

    const b = BOUNDS[city];
    offers.forEach((o) => {
      expect(o.location!.latitude).toBeGreaterThan(b.lat[0]);
      expect(o.location!.latitude).toBeLessThan(b.lat[1]);
      expect(o.location!.longitude).toBeGreaterThan(b.lng[0]);
      expect(o.location!.longitude).toBeLessThan(b.lng[1]);
    });
  });

  it('marks every offer as an active sample with sane values', () => {
    CITY_SAMPLE_OFFERS.forEach((o) => {
      expect(o.isSample).toBe(true);
      expect(o.scope).toBe('LOCAL');
      expect(isOfferActiveAndValid(o)).toBe(true);
      if (o.valueType === 'PERCENTAGE') {
        expect(o.value).toBeGreaterThanOrEqual(10);
        expect(o.value).toBeLessThanOrEqual(60);
      } else {
        expect(o.value).toBeGreaterThanOrEqual(100);
      }
      expect(o.termsAndConditions.some((t) => /sample offer/i.test(t))).toBe(true);
    });
  });

  it('is deterministic apart from validity windows', () => {
    const a = generateCitySampleOffers('HYD', { now: 0 });
    const b = generateCitySampleOffers('HYD', { now: 0 });
    expect(a).toEqual(b);
  });

  it('places offers near each locality centre (within ~1 km)', () => {
    const offers = generateCitySampleOffers('BLR');
    offers.forEach((o) => {
      const loc = CITY_LOCALITIES.BLR.find((l) => o.location!.label.endsWith(l.name))!;
      const d = calculateHaversineDistanceKm(
        { latitude: loc.lat, longitude: loc.lng },
        { latitude: o.location!.latitude, longitude: o.location!.longitude }
      );
      expect(d).toBeLessThan(1);
    });
  });
});
