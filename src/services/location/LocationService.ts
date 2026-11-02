/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LocationCoordinates } from '../../domain/models/Offer';

export type LocationErrorType =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NOT_SUPPORTED'
  | 'UNKNOWN';

export interface LocationResult {
  coordinates: LocationCoordinates;
  label: string;
  source: 'BROWSER_GPS' | 'DEMO_LOCATION';
}

export interface LocationError {
  type: LocationErrorType;
  message: string;
}

export interface ILocationService {
  getCurrentLocation(): Promise<LocationResult>;
  /** Sample anchor location. city: 'HYD' (default, Banjara Hills) or 'BLR' (Koramangala). */
  getDemoLocation(city?: 'HYD' | 'BLR'): LocationResult;
  checkPermissionState(): Promise<PermissionState | 'unsupported'>;
}
