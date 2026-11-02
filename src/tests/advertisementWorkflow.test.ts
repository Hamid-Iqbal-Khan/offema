/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AdvertisementService } from '../services/advertisements/AdvertisementService';
import { AuthUser } from '../domain/models/Offer';
import { AdvertisementSubmissionPayload } from '../domain/models/Advertisement';

describe('Advertisement Submission & Approval Workflow', () => {
  let adService: AdvertisementService;

  const mockAdvertizer: AuthUser = {
    uid: 'adv-test-101',
    phoneNumber: '9811122233',
    countryCode: '+91',
    displayName: 'Baker Shop',
    createdAt: new Date().toISOString(),
    isDemoUser: true,
    role: 'ADVERTIZER',
  };

  const mockConsumer: AuthUser = {
    uid: 'user-test-202',
    phoneNumber: '9876543210',
    countryCode: '+91',
    displayName: 'Regular Consumer',
    createdAt: new Date().toISOString(),
    isDemoUser: true,
    role: 'USER',
  };

  const mockAdmin: AuthUser = {
    uid: 'admin-root',
    phoneNumber: '9999999999',
    countryCode: '+91',
    displayName: 'Authorized Admin',
    createdAt: new Date().toISOString(),
    isDemoUser: true,
    role: 'ADMIN',
  };

  const samplePayload: AdvertisementSubmissionPayload = {
    title: '50% Off Gourmet Lunch Buffet',
    providerName: 'The Royal Bistro',
    description: 'All-you-can-eat multicuisine lunch buffet with signature desserts.',
    categoryId: 'food-dining',
    categoryName: 'Food & Dining',
    valueType: 'PERCENTAGE',
    value: 50,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Banjara Hills',
      address: 'Road No. 2, Banjara Hills, Hyderabad',
      latitude: 17.4156,
      longitude: 78.4350,
      city: 'Hyderabad',
    },
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    termsAndConditions: ['Valid Monday to Friday only.', 'Prior table reservation required.'],
    promoCode: 'ROYAL50',
  };

  beforeEach(() => {
    adService = new AdvertisementService();
  });

  it('allows Advertizers to submit ads and places them in PENDING_APPROVAL status', async () => {
    const ad = await adService.submitAdvertisement(samplePayload, mockAdvertizer);

    expect(ad).toBeDefined();
    expect(ad.status).toBe('PENDING_APPROVAL');
    expect(ad.advertizerUid).toBe(mockAdvertizer.uid);
    expect(ad.title).toBe(samplePayload.title);
    expect(ad.auditTrail.length).toBeGreaterThan(0);
    expect(ad.auditTrail[0].action).toBe('SUBMITTED');
  });

  it('prevents regular users without Advertizer role from submitting ads', async () => {
    await expect(
      adService.submitAdvertisement(samplePayload, mockConsumer)
    ).rejects.toThrow('Permission Denied');
  });

  it('allows Admin to approve ads, automatically publishing them to live active offers', async () => {
    const ad = await adService.submitAdvertisement(samplePayload, mockAdvertizer);

    // Initial check: pending ads are NEVER published
    let liveOffers = await adService.getApprovedPublishedOffers();
    expect(liveOffers.some((o) => o.id.includes(ad.id))).toBe(false);

    // Admin approves
    const approved = await adService.approveAdvertisement(ad.id, mockAdmin, 'Verified shop certificate.');
    expect(approved.status).toBe('APPROVED');
    expect(approved.reviewedBy).toBe(mockAdmin.displayName);

    // Check live offers now includes the approved ad
    liveOffers = await adService.getApprovedPublishedOffers();
    const publishedOffer = liveOffers.find((o) => o.id === approved.publishedOfferId);
    expect(publishedOffer).toBeDefined();
    expect(publishedOffer?.title).toBe(samplePayload.title);
    expect(publishedOffer?.isActive).toBe(true);

    // Check notification was generated for Advertizer
    const notifs = await adService.getNotifications(mockAdvertizer);
    const approvalNotif = notifs.find((n) => n.advertisementId === ad.id);
    expect(approvalNotif).toBeDefined();
    expect(approvalNotif?.type).toBe('APPROVAL');
  });

  it('requires mandatory rejection reason when rejecting and notifies Advertizer', async () => {
    const ad = await adService.submitAdvertisement(samplePayload, mockAdvertizer);

    // Empty rejection reason must fail
    await expect(adService.rejectAdvertisement(ad.id, '', mockAdmin)).rejects.toThrow(
      'rejection reason'
    );

    // Too short rejection reason must fail
    await expect(adService.rejectAdvertisement(ad.id, 'no', mockAdmin)).rejects.toThrow(
      'rejection reason'
    );

    // Valid rejection
    const reasonText = 'Please provide registered company GSTIN and specific weekend blackout terms.';
    const rejected = await adService.rejectAdvertisement(ad.id, reasonText, mockAdmin);
    expect(rejected.status).toBe('REJECTED');
    expect(rejected.rejectionReason).toBe(reasonText);

    // Rejected ads must NEVER be in live published offers
    const liveOffers = await adService.getApprovedPublishedOffers();
    expect(liveOffers.some((o) => o.id.includes(ad.id))).toBe(false);

    // Check rejection notification delivered
    const notifs = await adService.getNotifications(mockAdvertizer);
    const rejectionNotif = notifs.find((n) => n.advertisementId === ad.id);
    expect(rejectionNotif).toBeDefined();
    expect(rejectionNotif?.type).toBe('REJECTION');
    expect(rejectionNotif?.rejectionReason).toBe(reasonText);
  });

  it('enforces reapproval workflow when Advertizer modifies an existing ad', async () => {
    const ad = await adService.submitAdvertisement(samplePayload, mockAdvertizer);
    await adService.approveAdvertisement(ad.id, mockAdmin);

    // Advertizer edits discount value on approved ad
    const updated = await adService.updateAdvertisement(
      ad.id,
      { value: 60, title: '60% Off Gourmet Lunch Buffet' },
      mockAdvertizer
    );

    // Must reset to PENDING_APPROVAL for reapproval!
    expect(updated.status).toBe('PENDING_APPROVAL');
    expect(updated.value).toBe(60);

    const lastAudit = updated.auditTrail[updated.auditTrail.length - 1];
    expect(lastAudit.action).toBe('EDITED');
  });

  it('prevents non-admins from approving or rejecting advertisements', async () => {
    const ad = await adService.submitAdvertisement(samplePayload, mockAdvertizer);

    // Advertizer trying to approve own ad
    await expect(adService.approveAdvertisement(ad.id, mockAdvertizer)).rejects.toThrow(
      'Security Violation'
    );

    // Consumer trying to reject ad
    await expect(
      adService.rejectAdvertisement(ad.id, 'Spam content', mockConsumer)
    ).rejects.toThrow('Security Violation');
  });
});
