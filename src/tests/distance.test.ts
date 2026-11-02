/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { calculateHaversineDistanceKm, formatDistance } from '../domain/logic/distance';

describe('Distance Logic (Haversine & Formatter)', () => {
  it('returns 0 for identical coordinates', () => {
    const origin = { latitude: 17.4156, longitude: 78.435 };
    const dist = calculateHaversineDistanceKm(origin, origin);
    expect(dist).toBe(0);
  });

  it('calculates geographic distance correctly between two known points', () => {
    // Banjara Hills (17.4156° N, 78.4350° E) to Somajiguda (17.4258° N, 78.4552° E)
    const banjara = { latitude: 17.4156, longitude: 78.435 };
    const somajiguda = { latitude: 17.4258, longitude: 78.4552 };

    const distance = calculateHaversineDistanceKm(banjara, somajiguda);
    // Real distance is ~2.4 km
    expect(distance).toBeGreaterThan(2.0);
    expect(distance).toBeLessThan(2.8);
  });

  it('formats distances under 1 km as meters', () => {
    expect(formatDistance(0.45)).toBe('450 m');
    expect(formatDistance(0.05)).toBe('50 m');
    expect(formatDistance(0.89)).toBe('890 m');
  });

  it('formats distances 1 km and above as kilometers with 1 decimal place', () => {
    expect(formatDistance(1.23)).toBe('1.2 km');
    expect(formatDistance(5.0)).toBe('5.0 km');
    expect(formatDistance(12.78)).toBe('12.8 km');
  });

  it('handles negative or 0 distance gracefully', () => {
    expect(formatDistance(0)).toBe('0 m');
    expect(formatDistance(-1)).toBe('0 m');
  });
});
