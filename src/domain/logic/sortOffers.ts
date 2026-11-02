/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OfferWithDistance, SortOption } from '../models/Offer';

/**
 * Computes an effective score for comparing offers of potentially mixed value types.
 *
 * SPECIFICATION COMPLIANCE NOTE:
 * The specification mandates: "Do not compare percentage values and currency values
 * as though they share the same scale. Mixed types should use an explicit rankingScore
 * supplied by the dataset or be grouped by offer type. Do not invent a financial
 * equivalence between percentage and rupee offers."
 *
 * Rule:
 * 1. If explicit `rankingScore` exists on the offer, it is authoritative.
 * 2. If both offers are same valueType, their raw numerical `value` is compared directly.
 * 3. If mixed types lack `rankingScore`, we maintain a deterministic tier order:
 *    Percentage offers (ranked by percentage) followed by Fixed Amount offers (ranked by amount).
 */
function getOfferComparisonMetric(offer: OfferWithDistance): {
  typeWeight: number;
  value: number;
  hasExplicitScore: boolean;
  score: number;
} {
  if (typeof offer.rankingScore === 'number') {
    return {
      typeWeight: 0,
      value: offer.value,
      hasExplicitScore: true,
      score: offer.rankingScore,
    };
  }

  // Type grouping when explicit rankingScore is not provided:
  // Tier 1: PERCENTAGE (e.g. 50% > 20%)
  // Tier 2: FIXED_AMOUNT (e.g. ₹1000 > ₹250)
  const typeWeight = offer.valueType === 'PERCENTAGE' ? 2 : 1;
  return {
    typeWeight,
    value: offer.value,
    hasExplicitScore: false,
    score: offer.value,
  };
}

/**
 * Deterministic tie-breaker:
 * 1. Nearer distance first (if distances available)
 * 2. Offer title alphabetically (A-Z)
 */
function breakTie(a: OfferWithDistance, b: OfferWithDistance): number {
  const distA = typeof a.distanceKm === 'number' ? a.distanceKm : Infinity;
  const distB = typeof b.distanceKm === 'number' ? b.distanceKm : Infinity;

  if (distA !== distB) {
    return distA - distB;
  }

  return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
}

/**
 * Sorts offers according to selected sort criteria.
 * Does NOT mutate the input array (pure function).
 *
 * @param offers - Input offers with calculated distances
 * @param sortOption - Sort preference ('HIGHEST_OFFER' is default)
 */
export function sortOffers(
  offers: readonly OfferWithDistance[],
  sortOption: SortOption = 'HIGHEST_OFFER'
): OfferWithDistance[] {
  const sorted = [...offers];

  sorted.sort((a, b) => {
    switch (sortOption) {
      case 'HIGHEST_OFFER': {
        const metricA = getOfferComparisonMetric(a);
        const metricB = getOfferComparisonMetric(b);

        // If both have explicit rankingScore, use ranking score
        if (metricA.hasExplicitScore && metricB.hasExplicitScore) {
          const diff = metricB.score - metricA.score;
          if (diff !== 0) return diff;
          return breakTie(a, b);
        }

        // If same value type, compare values directly
        if (a.valueType === b.valueType) {
          const diff = b.value - a.value;
          if (diff !== 0) return diff;
          return breakTie(a, b);
        }

        // Mixed types without explicit scores: group by type tier, then by value within tier
        if (metricA.typeWeight !== metricB.typeWeight) {
          return metricB.typeWeight - metricA.typeWeight;
        }

        const diff = b.value - a.value;
        if (diff !== 0) return diff;
        return breakTie(a, b);
      }

      case 'LOWEST_OFFER': {
        const metricA = getOfferComparisonMetric(a);
        const metricB = getOfferComparisonMetric(b);

        if (metricA.hasExplicitScore && metricB.hasExplicitScore) {
          const diff = metricA.score - metricB.score;
          if (diff !== 0) return diff;
          return breakTie(a, b);
        }

        if (a.valueType === b.valueType) {
          const diff = a.value - b.value;
          if (diff !== 0) return diff;
          return breakTie(a, b);
        }

        if (metricA.typeWeight !== metricB.typeWeight) {
          return metricA.typeWeight - metricB.typeWeight;
        }

        const diff = a.value - b.value;
        if (diff !== 0) return diff;
        return breakTie(a, b);
      }

      case 'NEAREST': {
        const distA = typeof a.distanceKm === 'number' ? a.distanceKm : Infinity;
        const distB = typeof b.distanceKm === 'number' ? b.distanceKm : Infinity;

        if (distA !== distB) {
          return distA - distB;
        }

        // Tie-breaker: Highest offer within the same distance
        if (a.valueType === b.valueType && a.value !== b.value) {
          return b.value - a.value;
        }

        return a.title.localeCompare(b.title);
      }

      case 'NEWEST': {
        const timeA = new Date(a.validFrom).getTime();
        const timeB = new Date(b.validFrom).getTime();

        if (timeA !== timeB) {
          return timeB - timeA;
        }

        return breakTie(a, b);
      }

      default:
        return 0;
    }
  });

  return sorted;
}
