/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ILocationService, LocationError, LocationResult } from './LocationService';

// Standard demo coordinate anchor: Banjara Hills, Hyderabad, India
/** Bengaluru sample anchor: Koramangala */
export const BLR_DEMO_COORDINATES = {
  latitude: 12.9352,
  longitude: 77.6245,
};

export const DEMO_COORDINATES = {
  latitude: 17.4156,
  longitude: 78.4350,
  accuracy: 15,
};

export class BrowserGeolocationService implements ILocationService {
  async checkPermissionState(): Promise<PermissionState | 'unsupported'> {
    if (typeof navigator === 'undefined' || !navigator.permissions) {
      return 'unsupported';
    }

    try {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return status.state;
    } catch {
      return 'unsupported';
    }
  }

  getCurrentLocation(): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        const err: LocationError = {
          type: 'NOT_SUPPORTED',
          message: 'Geolocation is not supported by your current browser environment.',
        };
        return reject(err);
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Sensitive coordinates are kept in-memory; not logged to console
          resolve({
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            },
            label: 'Current Device Location',
            source: 'BROWSER_GPS',
          });
        },
        (error) => {
          let type: LocationError['type'] = 'UNKNOWN';
          let message = 'Unable to retrieve your location.';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              type = 'PERMISSION_DENIED';
              message = 'Location access was denied. You can still explore Global Offers or switch to Demo Location.';
              break;
            case error.POSITION_UNAVAILABLE:
              type = 'POSITION_UNAVAILABLE';
              message = 'Location information is currently unavailable from your device.';
              break;
            case error.TIMEOUT:
              type = 'TIMEOUT';
              message = 'Location request timed out. Please try again or use Demo Location.';
              break;
          }

          reject({ type, message } as LocationError);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  getDemoLocation(city: 'HYD' | 'BLR' = 'HYD'): LocationResult {
    if (city === 'BLR') {
      return {
        coordinates: BLR_DEMO_COORDINATES,
        label: 'Koramangala, Bengaluru (Demo)',
        source: 'DEMO_LOCATION',
      };
    }
    return {
      coordinates: DEMO_COORDINATES,
      label: 'Banjara Hills, Hyderabad (Demo)',
      source: 'DEMO_LOCATION',
    };
  }
}

export const browserGeolocationService = new BrowserGeolocationService();
