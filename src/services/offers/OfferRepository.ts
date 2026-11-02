/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Offer, OfferCategory } from '../../domain/models/Offer';

export interface IOfferRepository {
  /**
   * Fetches all active offers. Expired or inactive records are filtered out.
   */
  getActiveOffers(): Promise<Offer[]>;

  /**
   * Fetches a single offer by its unique identifier.
   */
  getOfferById(id: string): Promise<Offer | null>;

  /**
   * Fetches all configured active offer categories.
   */
  getCategories(): Promise<OfferCategory[]>;

  /**
   * Optional method to access all offers including expired/inactive
   * specifically for administrative or test evaluation purposes.
   */
  getRawFixtureOffers?(): Promise<Offer[]>;
}
