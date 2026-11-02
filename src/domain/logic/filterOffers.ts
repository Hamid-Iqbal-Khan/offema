/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FilterCriteria, OfferWithDistance } from '../models/Offer';
import { isOfferActiveAndValid } from './offerValidity';

/**
 * Filters a list of offers according to active criteria using strict AND logic.
 *
 * Rules:
 * - Does NOT mutate original array (pure function).
 * - Excludes inactive or expired offers.
 * - Filters by scope (Nearby/Local vs Global).
 * - Keyword search checks title, description, merchant name, and category name.
 * - Distance filter applies when maxDistanceKm is specified.
 * - Offer value filters handle percentage and fixed amounts independently without false equivalence.
 */
export function filterOffers(
  offers: readonly OfferWithDistance[],
  criteria: Partial<FilterCriteria>,
  referenceDate: Date = new Date()
): OfferWithDistance[] {
  return offers.filter((offer) => {
    // 1. Offer must be currently active and within valid dates
    if (!isOfferActiveAndValid(offer, referenceDate)) {
      return false;
    }

    // 2. Scope filter (Nearby vs Global)
    if (criteria.scopeFilter === 'LOCAL') {
      if (offer.scope !== 'LOCAL') return false;
    } else if (criteria.scopeFilter === 'GLOBAL') {
      if (offer.scope === 'LOCAL') return false;
    }

    // 3. Keyword search (case-insensitive)
    if (criteria.keyword && criteria.keyword.trim().length > 0) {
      const q = criteria.keyword.toLowerCase().trim();
      const matchTitle = offer.title.toLowerCase().includes(q);
      const matchDesc = offer.description.toLowerCase().includes(q);
      const matchProvider = offer.providerName.toLowerCase().includes(q);
      const matchCategory = offer.categoryName.toLowerCase().includes(q);
      const matchLocation = offer.location?.label.toLowerCase().includes(q) || false;

      if (!matchTitle && !matchDesc && !matchProvider && !matchCategory && !matchLocation) {
        return false;
      }
    }

    // 4. Category filter (multi-select)
    if (criteria.categoryIds && criteria.categoryIds.length > 0) {
      if (!criteria.categoryIds.includes(offer.categoryId)) {
        return false;
      }
    }

    // 5. Distance filter (for offers with distance info)
    if (typeof criteria.maxDistanceKm === 'number' && criteria.maxDistanceKm > 0) {
      if (offer.scope === 'LOCAL') {
        if (typeof offer.distanceKm !== 'number' || offer.distanceKm > criteria.maxDistanceKm) {
          return false;
        }
      }
    }

    // 6. Offer Value Filters (Honoring typed model without false currency-percentage equivalence)
    if (typeof criteria.minPercentageValue === 'number' && criteria.minPercentageValue > 0) {
      if (offer.valueType === 'PERCENTAGE' && offer.value < criteria.minPercentageValue) {
        return false;
      }
    }

    if (typeof criteria.minFixedAmountValue === 'number' && criteria.minFixedAmountValue > 0) {
      if (offer.valueType === 'FIXED_AMOUNT' && offer.value < criteria.minFixedAmountValue) {
        return false;
      }
    }

    return true;
  });
}
