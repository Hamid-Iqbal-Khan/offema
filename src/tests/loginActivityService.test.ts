/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LoginActivityService } from '../services/auth/LoginActivityService';
import { AuthUser } from '../domain/models/Offer';

// Polyfill localStorage in Node test runner
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: unknown }).localStorage = createMockLocalStorage();
}

describe('LoginActivityService - Login Tracking & Metrics', () => {
  let service: LoginActivityService;

  const mockUser: AuthUser = {
    uid: 'test_user_activity_1',
    phoneNumber: '9876543210',
    countryCode: '+91',
    displayName: 'Test User',
    createdAt: new Date().toISOString(),
    isDemoUser: true,
    role: 'USER',
  };

  beforeEach(() => {
    localStorage.clear();
    service = new LoginActivityService();
  });

  it('records successful login event with platform detection', async () => {
    const record = await service.recordSuccessfulLogin(mockUser, 'ANDROID', 'Pixel 8');

    expect(record.userId).toBe(mockUser.uid);
    expect(record.status).toBe('SUCCESS');
    expect(record.platform).toBe('ANDROID');
    expect(record.deviceInfo).toBe('Pixel 8');
    expect(record.timestamp).toBeDefined();
  });

  it('records failed login attempts without storing credentials or passwords', async () => {
    const failRecord = await service.recordFailedLogin(
      '9876543210',
      'Incorrect verification code',
      'IOS',
      'iPhone 15'
    );

    expect(failRecord.status).toBe('FAILED');
    expect(failRecord.failureReason).toBe('Incorrect verification code');
    expect(failRecord.platform).toBe('IOS');
    // Ensure no password or sensitive token property exists
    expect(((failRecord as unknown) as Record<string, unknown>).password).toBeUndefined();
    expect(((failRecord as unknown) as Record<string, unknown>).token).toBeUndefined();
  });

  it('debounces rapid duplicate logins within 3 seconds', async () => {
    const first = await service.recordSuccessfulLogin(mockUser, 'WEB');
    const second = await service.recordSuccessfulLogin(mockUser, 'WEB');

    expect(first.id).toBe(second.id);
  });

  it('computes DAU, WAU, MAU, and platform distributions', async () => {
    // Record login for our test user
    await service.recordSuccessfulLogin(mockUser, 'WEB');

    const metrics = await service.getActivityMetrics();

    expect(metrics.totalRegisteredUsers).toBeGreaterThanOrEqual(1);
    expect(metrics.activeUsersToday).toBeGreaterThanOrEqual(1);
    expect(metrics.activeUsersThisWeek).toBeGreaterThanOrEqual(1);
    expect(metrics.activeUsersThisMonth).toBeGreaterThanOrEqual(1);

    expect(metrics.platformBreakdown).toBeDefined();
    expect(typeof metrics.platformBreakdown.android).toBe('number');
    expect(typeof metrics.platformBreakdown.ios).toBe('number');
    expect(typeof metrics.platformBreakdown.web).toBe('number');

    expect(Array.isArray(metrics.recentLoginTrends)).toBe(true);
    expect(metrics.recentLoginTrends.length).toBe(7);
  });
});
