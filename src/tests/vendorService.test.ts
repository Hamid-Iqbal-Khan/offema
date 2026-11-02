/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VendorService } from '../services/vendors/VendorService';
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

describe('VendorService - Vendor Management & Onboarding Workflow', () => {
  let service: VendorService;

  const mockAdmin: AuthUser = {
    uid: 'admin_root',
    phoneNumber: '9999999999',
    countryCode: '+91',
    displayName: 'Authorized Admin',
    createdAt: new Date().toISOString(),
    isDemoUser: true,
    role: 'ADMIN',
  };

  const mockAdvertizer: AuthUser = {
    uid: 'adv_owner_101',
    phoneNumber: '9811122233',
    countryCode: '+91',
    displayName: 'Artisan Owner',
    createdAt: new Date().toISOString(),
    isDemoUser: true,
    role: 'ADVERTIZER',
  };

  const mockOtherUser: AuthUser = {
    uid: 'other_user_202',
    phoneNumber: '9876543210',
    countryCode: '+91',
    displayName: 'Other User',
    createdAt: new Date().toISOString(),
    isDemoUser: true,
    role: 'USER',
  };

  beforeEach(() => {
    localStorage.clear();
    service = new VendorService();
  });

  it('atomically registers a new vendor profile with initial onboarding progress', async () => {
    const newVendor = await service.registerVendor(
      {
        userId: mockAdvertizer.uid,
        businessName: 'Fresh Brew Coffee Lab',
        category: 'food-dining',
        contactPhone: '+91 98111 22233',
        contactEmail: 'contact@coffeelab.test',
        address: 'Road 10, Banjara Hills',
        city: 'Hyderabad',
      },
      mockAdvertizer
    );

    expect(newVendor.id).toBeDefined();
    expect(newVendor.businessName).toBe('Fresh Brew Coffee Lab');
    expect(newVendor.onboardingStatus).toBe('REGISTERED');
    expect(newVendor.onboardingProgress).toBe(25);
    expect(newVendor.status).toBe('ACTIVE');
  });

  it('updates vendor profile and enforces RBAC isolation', async () => {
    const registered = await service.registerVendor(
      {
        userId: mockAdvertizer.uid,
        businessName: 'Initial Business',
        category: 'services',
        contactPhone: '+91 98111 22233',
      },
      mockAdvertizer
    );

    // Another user cannot edit this vendor
    await expect(
      service.updateVendor(registered.id, { businessName: 'Hacked' }, mockOtherUser)
    ).rejects.toThrow(/unauthorized/i);

    // Owner can edit
    const updated = await service.updateVendor(
      registered.id,
      { businessName: 'Updated Name', operatingHours: '9am - 9pm' },
      mockAdvertizer
    );
    expect(updated.businessName).toBe('Updated Name');
    expect(updated.operatingHours).toBe('9am - 9pm');

    // Admin can also edit
    const adminUpdated = await service.updateVendor(
      registered.id,
      { verificationBadge: true },
      mockAdmin
    );
    expect(adminUpdated.verificationBadge).toBe(true);
  });

  it('tracks onboarding stepper progress from 25% to 100%', async () => {
    const registered = await service.registerVendor(
      {
        userId: mockAdvertizer.uid,
        businessName: 'Stepping Stones Cafe',
        category: 'food-dining',
        contactPhone: '+91 98111 22233',
      },
      mockAdvertizer
    );

    const step2 = await service.updateOnboardingProgress(registered.id, 'PROFILE_COMPLETED', 50);
    expect(step2.onboardingStatus).toBe('PROFILE_COMPLETED');
    expect(step2.onboardingProgress).toBe(50);

    const step3 = await service.updateOnboardingProgress(registered.id, 'FIRST_OFFER_DRAFTED', 75);
    expect(step3.onboardingProgress).toBe(75);

    const step4 = await service.updateOnboardingProgress(registered.id, 'COMPLETED', 100);
    expect(step4.onboardingProgress).toBe(100);
  });

  it('records real analytics events (VIEW, CLICK, ENGAGE, CONVERT) and prevents data leakage', async () => {
    const registered = await service.registerVendor(
      {
        userId: mockAdvertizer.uid,
        businessName: 'Analytics Test Brand',
        category: 'fashion',
        contactPhone: '+91 98111 22233',
      },
      mockAdvertizer
    );

    // Record impressions and interactions
    await service.recordVendorEvent(registered.id, 'VIEW');
    await service.recordVendorEvent(registered.id, 'VIEW');
    await service.recordVendorEvent(registered.id, 'CLICK');
    await service.recordVendorEvent(registered.id, 'CONVERT');

    // Owner can view analytics
    const analytics = await service.getVendorAnalytics(registered.id, mockAdvertizer);
    expect(analytics.totalViews).toBeGreaterThanOrEqual(2);
    expect(analytics.totalClicks).toBeGreaterThanOrEqual(1);
    expect(analytics.totalConversions).toBeGreaterThanOrEqual(1);

    // Other user cannot view analytics
    await expect(
      service.getVendorAnalytics(registered.id, mockOtherUser)
    ).rejects.toThrow(/unauthorized/i);
  });
});
