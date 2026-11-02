/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Offer } from '../models/Offer';

export type ExpiryStatus = 'ACTIVE' | 'EXPIRED' | 'NOT_YET_STARTED' | 'INACTIVE';

export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  urgencyLevel: 'CRITICAL' | 'URGENT' | 'NORMAL';
  formattedCompact: string;
  formattedDetailed: string;
}

/**
 * Checks whether an offer is active and currently within its validity period.
 *
 * Boundary rules:
 * - Current time >= validFrom (inclusive)
 * - Current time <= validUntil (inclusive)
 * - offer.isActive === true
 *
 * @param offer - The offer to validate
 * @param referenceDate - Current or evaluation date (defaults to now)
 */
export function isOfferActiveAndValid(offer: Offer, referenceDate: Date = new Date()): boolean {
  if (!offer.isActive) {
    return false;
  }

  const refTime = referenceDate.getTime();
  const startTime = new Date(offer.validFrom).getTime();
  const endTime = new Date(offer.validUntil).getTime();

  if (isNaN(startTime) || isNaN(endTime)) {
    return false;
  }

  return refTime >= startTime && refTime <= endTime;
}

/**
 * Determines the detailed lifecycle status of an offer.
 */
export function getOfferExpiryStatus(offer: Offer, referenceDate: Date = new Date()): ExpiryStatus {
  if (!offer.isActive) {
    return 'INACTIVE';
  }

  const refTime = referenceDate.getTime();
  const startTime = new Date(offer.validFrom).getTime();
  const endTime = new Date(offer.validUntil).getTime();

  if (isNaN(startTime) || isNaN(endTime)) {
    return 'INACTIVE';
  }

  if (refTime < startTime) {
    return 'NOT_YET_STARTED';
  }

  if (refTime > endTime) {
    return 'EXPIRED';
  }

  return 'ACTIVE';
}

/**
 * Calculates detailed countdown time remaining until an offer expires.
 *
 * Urgency levels:
 * - CRITICAL: Less than 24 hours remaining (red/rose urgency)
 * - URGENT: Less than 48 hours remaining (amber urgency)
 * - NORMAL: 48 hours or more remaining
 */
export function getTimeRemaining(validUntil: string, referenceDate: Date = new Date()): TimeRemaining {
  const endTime = new Date(validUntil).getTime();
  const nowTime = referenceDate.getTime();

  if (isNaN(endTime)) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      urgencyLevel: 'CRITICAL',
      formattedCompact: 'Expired',
      formattedDetailed: 'Offer has expired',
    };
  }

  const totalMs = Math.max(0, endTime - nowTime);
  const isExpired = totalMs <= 0;

  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let urgencyLevel: 'CRITICAL' | 'URGENT' | 'NORMAL' = 'NORMAL';
  if (totalMs < 24 * 3600 * 1000) {
    urgencyLevel = 'CRITICAL';
  } else if (totalMs < 48 * 3600 * 1000) {
    urgencyLevel = 'URGENT';
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  let formattedCompact = '';
  if (isExpired) {
    formattedCompact = 'Expired';
  } else if (days > 0) {
    formattedCompact = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  } else {
    formattedCompact = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  let formattedDetailed = '';
  if (isExpired) {
    formattedDetailed = 'Offer has expired';
  } else if (days > 0) {
    formattedDetailed = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s left`;
  } else {
    formattedDetailed = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s left`;
  }

  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    isExpired,
    urgencyLevel,
    formattedCompact,
    formattedDetailed,
  };
}

/**
 * Checks if an active offer expires within the next N hours (default: 48 hours).
 */
export function isExpiringSoon(
  offer: Offer,
  referenceDate: Date = new Date(),
  hoursThreshold: number = 48
): boolean {
  if (!isOfferActiveAndValid(offer, referenceDate)) {
    return false;
  }

  const refTime = referenceDate.getTime();
  const endTime = new Date(offer.validUntil).getTime();
  const diffHours = (endTime - refTime) / (1000 * 60 * 60);

  return diffHours > 0 && diffHours <= hoursThreshold;
}

/**
 * Formats offer validity into human readable string.
 * Example: "Valid until 25 Oct 2026" or "Expires in 18 hours"
 */
export function formatValidityPeriod(offer: Offer, referenceDate: Date = new Date()): string {
  const status = getOfferExpiryStatus(offer, referenceDate);

  if (status === 'INACTIVE') {
    return 'Inactive';
  }
  if (status === 'NOT_YET_STARTED') {
    const startDate = new Date(offer.validFrom).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
    });
    return `Starts ${startDate}`;
  }
  if (status === 'EXPIRED') {
    const endDate = new Date(offer.validUntil).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
    });
    return `Expired on ${endDate}`;
  }

  const remaining = getTimeRemaining(offer.validUntil, referenceDate);

  if (remaining.days === 0) {
    return `Expires in ${remaining.formattedCompact}`;
  }

  if (remaining.days <= 2) {
    return `Expires in ${remaining.days}d ${remaining.hours}h`;
  }

  const endDate = new Date(offer.validUntil).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `Valid until ${endDate}`;
}
