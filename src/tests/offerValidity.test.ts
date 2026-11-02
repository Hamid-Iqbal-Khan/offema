/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  isOfferActiveAndValid,
  getOfferExpiryStatus,
  isExpiringSoon,
  getTimeRemaining,
} from '../domain/logic/offerValidity';
import { Offer } from '../domain/models/Offer';

const BASE_OFFER: Offer = {
  id: 'test-offer-1',
  title: 'Test Offer 25% Off',
  providerId: 'prov-1',
  providerName: 'Test Merchant',
  description: 'Test description',
  categoryId: 'food-dining',
  categoryName: 'Food & Dining',
  valueType: 'PERCENTAGE',
  value: 25,
  currency: 'INR',
  scope: 'LOCAL',
  validFrom: '2026-10-01T00:00:00.000Z',
  validUntil: '2026-10-31T23:59:59.000Z',
  termsAndConditions: ['T&C 1'],
  imageUrls: [],
  isActive: true,
};

describe('Offer Validity & Countdown Logic', () => {
  it('returns true when current date is inside validity window and isActive is true', () => {
    const insideDate = new Date('2026-10-15T12:00:00.000Z');
    expect(isOfferActiveAndValid(BASE_OFFER, insideDate)).toBe(true);
    expect(getOfferExpiryStatus(BASE_OFFER, insideDate)).toBe('ACTIVE');
  });

  it('boundary test: returns true exactly at validFrom', () => {
    const exactStart = new Date('2026-10-01T00:00:00.000Z');
    expect(isOfferActiveAndValid(BASE_OFFER, exactStart)).toBe(true);
  });

  it('boundary test: returns true exactly at validUntil', () => {
    const exactEnd = new Date('2026-10-31T23:59:59.000Z');
    expect(isOfferActiveAndValid(BASE_OFFER, exactEnd)).toBe(true);
  });

  it('boundary test: returns false 1 millisecond after validUntil', () => {
    const pastEnd = new Date('2026-11-01T00:00:00.000Z');
    expect(isOfferActiveAndValid(BASE_OFFER, pastEnd)).toBe(false);
    expect(getOfferExpiryStatus(BASE_OFFER, pastEnd)).toBe('EXPIRED');
  });

  it('returns false before validFrom has started', () => {
    const beforeStart = new Date('2026-09-30T23:59:59.000Z');
    expect(isOfferActiveAndValid(BASE_OFFER, beforeStart)).toBe(false);
    expect(getOfferExpiryStatus(BASE_OFFER, beforeStart)).toBe('NOT_YET_STARTED');
  });

  it('returns false when isActive is set to false even within dates', () => {
    const inactiveOffer: Offer = { ...BASE_OFFER, isActive: false };
    const insideDate = new Date('2026-10-15T12:00:00.000Z');
    expect(isOfferActiveAndValid(inactiveOffer, insideDate)).toBe(false);
    expect(getOfferExpiryStatus(inactiveOffer, insideDate)).toBe('INACTIVE');
  });

  it('detects offers expiring soon within 48 hours', () => {
    const refDate = new Date('2026-10-30T12:00:00.000Z'); // ~36 hours before expiry
    expect(isExpiringSoon(BASE_OFFER, refDate, 48)).toBe(true);

    const earlyDate = new Date('2026-10-20T12:00:00.000Z'); // > 10 days before expiry
    expect(isExpiringSoon(BASE_OFFER, earlyDate, 48)).toBe(false);
  });

  describe('getTimeRemaining (Countdown Timer)', () => {
    it('correctly calculates days, hours, minutes, seconds remaining', () => {
      // Expiration: 2026-10-31T23:59:59.000Z
      // Ref: 2026-10-30T20:29:49.000Z -> exactly 1 day, 3 hours, 30 minutes, 10 seconds
      const ref = new Date('2026-10-30T20:29:49.000Z');
      const res = getTimeRemaining(BASE_OFFER.validUntil, ref);

      expect(res.isExpired).toBe(false);
      expect(res.days).toBe(1);
      expect(res.hours).toBe(3);
      expect(res.minutes).toBe(30);
      expect(res.seconds).toBe(10);
      expect(res.urgencyLevel).toBe('URGENT'); // < 48h
      expect(res.formattedCompact).toBe('1d 03h 30m 10s');
    });

    it('assigns CRITICAL urgency level for offers expiring in under 24 hours', () => {
      // Ref: 2026-10-31T18:00:00.000Z -> ~5h 59m 59s remaining
      const ref = new Date('2026-10-31T18:00:00.000Z');
      const res = getTimeRemaining(BASE_OFFER.validUntil, ref);

      expect(res.isExpired).toBe(false);
      expect(res.days).toBe(0);
      expect(res.hours).toBe(5);
      expect(res.urgencyLevel).toBe('CRITICAL');
      expect(res.formattedCompact).toMatch(/^05h 59m 59s/);
    });

    it('assigns NORMAL urgency level for offers with 48+ hours remaining', () => {
      const ref = new Date('2026-10-25T00:00:00.000Z'); // > 6 days left
      const res = getTimeRemaining(BASE_OFFER.validUntil, ref);

      expect(res.isExpired).toBe(false);
      expect(res.days).toBeGreaterThan(5);
      expect(res.urgencyLevel).toBe('NORMAL');
    });

    it('returns isExpired: true when end date has passed', () => {
      const pastRef = new Date('2026-11-05T00:00:00.000Z');
      const res = getTimeRemaining(BASE_OFFER.validUntil, pastRef);

      expect(res.isExpired).toBe(true);
      expect(res.formattedCompact).toBe('Expired');
    });
  });
});
