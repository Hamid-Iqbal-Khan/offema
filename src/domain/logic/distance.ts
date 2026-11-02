/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LocationCoordinates } from '../models/Offer';

const EARTH_RADIUS_KM = 6371; // Mean Earth radius in kilometers

/**
 * Converts degrees to radians.
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates great-circle distance between two geographic coordinates
 * using the Haversine formula.
 *
 * @param origin - Coordinates of the starting point (e.g., user location)
 * @param destination - Coordinates of the destination (e.g., offer location)
 * @returns Distance in kilometers
 */
export function calculateHaversineDistanceKm(
  origin: LocationCoordinates,
  destination: LocationCoordinates
): number {
  if (
    typeof origin.latitude !== 'number' ||
    typeof origin.longitude !== 'number' ||
    typeof destination.latitude !== 'number' ||
    typeof destination.longitude !== 'number'
  ) {
    throw new Error('Invalid coordinates supplied to calculateHaversineDistanceKm');
  }

  // Exact same point
  if (origin.latitude === destination.latitude && origin.longitude === destination.longitude) {
    return 0;
  }

  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLon = toRadians(destination.longitude - origin.longitude);

  const lat1Rad = toRadians(origin.latitude);
  const lat2Rad = toRadians(destination.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_KM * c;
  // Round to two decimal places
  return Math.round(distance * 100) / 100;
}

/**
 * Formats a distance in kilometers into a human-readable string.
 * - Under 1 km: formatted in meters (e.g. "450 m")
 * - 1 km and above: formatted in kilometers with 1 decimal place (e.g. "2.4 km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 0) return '0 m';

  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}
