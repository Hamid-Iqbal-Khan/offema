/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VendorStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'DEACTIVATED';
export type OnboardingStep = 'REGISTERED' | 'PROFILE_COMPLETED' | 'FIRST_OFFER_DRAFTED' | 'COMPLETED';

export interface VendorProfile {
  id: string;
  userId: string; // Associated User account ID
  businessName: string;
  legalEntityName?: string;
  category: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  status: VendorStatus;
  onboardingStatus: OnboardingStep;
  onboardingProgress: number; // 0 to 100 percentage
  registrationDate: string; // ISO-8601
  updatedAt: string; // ISO-8601
  verifiedAt?: string;
  verificationBadge: boolean;
  bannerImageUrl?: string;
  logoUrl?: string;
  description?: string;
  operatingHours?: string;
}

export interface CreateVendorPayload {
  userId: string;
  businessName: string;
  legalEntityName?: string;
  category: string;
  contactPhone: string;
  contactEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  bannerImageUrl?: string;
  logoUrl?: string;
}

export interface UpdateVendorPayload {
  businessName?: string;
  legalEntityName?: string;
  category?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  status?: VendorStatus;
  description?: string;
  operatingHours?: string;
  bannerImageUrl?: string;
  logoUrl?: string;
  onboardingStatus?: OnboardingStep;
  onboardingProgress?: number;
  verificationBadge?: boolean;
  verifiedAt?: string;
}

export interface VendorDailyMetric {
  date: string; // YYYY-MM-DD
  views: number;
  clicks: number;
  engagements: number;
  conversions: number;
}

export interface VendorAnalytics {
  vendorId: string;
  businessName: string;
  totalAdvertisements: number;
  publishedCount: number;
  pendingCount: number;
  draftCount: number;
  rejectedCount: number;
  expiredCount: number;
  totalViews: number;
  totalClicks: number;
  totalEngagements: number;
  totalConversions: number;
  clickThroughRatePercent: number;
  conversionRatePercent: number;
  dailyTrends: VendorDailyMetric[];
  lastUpdated: string; // ISO-8601
}
