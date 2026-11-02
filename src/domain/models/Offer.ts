/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OfferValueType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type OfferScope = 'LOCAL' | 'ONLINE' | 'NATIONAL' | 'BRAND_WIDE';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface OfferLocation {
  label: string;
  address?: string;
  latitude: number;
  longitude: number;
  city?: string;
}

export interface Review {
  id: string;
  displayName: string;
  rating: number; // 1 to 5
  text: string;
  createdAt: string; // ISO-8601
  isSample?: boolean;
}

export interface OfferCategory {
  id: string;
  name: string;
  isActive: boolean;
  displayOrder: number;
  iconName?: string;
}

export interface Offer {
  id: string;
  title: string;
  providerId: string;
  providerName: string;
  description: string;
  categoryId: string;
  categoryName: string;
  valueType: OfferValueType;
  value: number;
  currency?: 'INR' | 'USD';
  scope: OfferScope;
  location?: OfferLocation;
  validFrom: string;  // ISO-8601
  validUntil: string; // ISO-8601
  termsAndConditions: string[];
  imageUrls: string[];
  bannerImageUrl?: string;
  bannerInfo?: {
    originalDimensions: { width: number; height: number };
    standardDimensions: { width: number; height: number };
    standardSizeBytes: number;
    standardFormat: string;
    compressionRatioPercent: number;
    isStandardized: boolean;
  };
  isActive: boolean;
  audience?: string[];
  rankingScore?: number; // Optional explicit score for mixed-type comparison
  promoCode?: string;
  reviews?: Review[];
  /** True for generated demo/sample offers (fictional merchants); UI labels these as samples. */
  isSample?: boolean;
}

export interface OfferWithDistance extends Offer {
  distanceKm?: number;
  formattedDistance?: string;
}

export interface FilterCriteria {
  keyword: string;
  categoryIds: string[];
  maxDistanceKm?: number; // 1, 3, 5 (default), 10, or undefined for any
  minPercentageValue?: number;
  minFixedAmountValue?: number;
  scopeFilter: 'ALL' | 'LOCAL' | 'GLOBAL';
}

export type SortOption = 'HIGHEST_OFFER' | 'LOWEST_OFFER' | 'NEAREST' | 'NEWEST';

export type UserRole = 'USER' | 'ADVERTIZER' | 'ADMIN';

export interface AuthUser {
  uid: string;
  phoneNumber: string;
  countryCode: string;
  displayName?: string;
  createdAt: string;
  isDemoUser: boolean;
  role: UserRole;
  advertizerProfile?: {
    businessName?: string;
    contactPhone?: string;
  };
}
