/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OfferValueType, OfferScope, OfferLocation } from './Offer';

export type UserRole = 'USER' | 'ADVERTIZER' | 'ADMIN';

export type AdvertisementStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export type MediaFormatType = 'IMAGE' | 'VIDEO' | 'CAROUSEL';

export type AuditAction = 'DRAFTED' | 'SUBMITTED' | 'EDITED' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  timestamp: string; // ISO-8601
  performedByUid: string;
  performedByName: string;
  performedByRole: UserRole;
  notes?: string;
  changesSummary?: string;
}

export interface AIBannerAnalysisSummary {
  hasText: boolean;
  detectedText: string;
  keyElements: string[];
  cropRisk: 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  cropWarning?: string;
  recommendedStrategy: 'background-extension' | 'ambient-padding' | 'focal-crop';
  explanation: string;
  isAiPowered: boolean;
  canAdjustReliably?: boolean;
  unreliableReason?: string;
  suggestedAlternative?: string;
}

export interface BannerStandardizationInfo {
  originalFileName: string;
  originalFileType: string;
  originalSizeBytes: number;
  originalDimensions: { width: number; height: number };
  standardDimensions: { width: number; height: number }; // 1200 x 675
  standardSizeBytes: number;
  standardFormat: string; // 'image/webp' or 'image/jpeg'
  compressionRatioPercent: number; // e.g. 78.5 (%)
  cropStrategy?: string;
  optimizationStrategy?: 'ai-background-extension' | 'ai-ambient-glow' | 'ai-clean-fit' | 'cover-center';
  contentPreservationPercent?: number; // 100 = 100% full content preserved without clipping
  aiAnalysis?: AIBannerAnalysisSummary;
  processedAt: string; // ISO-8601
  isStandardized: boolean;
}

export interface VideoMediaInfo {
  videoUrl: string;
  thumbnailUrl: string;
  fileName: string;
  fileSizeBytes: number;
  durationSeconds?: number;
  format: string; // 'video/mp4' | 'video/webm'
}

export interface Advertisement {
  id: string;
  vendorId?: string; // Associated Vendor Profile ID
  advertizerUid: string;
  advertizerName: string;
  advertizerPhone: string;
  title: string;
  providerId: string;
  providerName: string;
  providerContact?: string;
  description: string;
  categoryId: string;
  categoryName: string;
  valueType: OfferValueType;
  value: number;
  currency: 'INR' | 'USD';
  scope: OfferScope;
  location?: OfferLocation;
  validFrom: string; // ISO-8601
  validUntil: string; // ISO-8601
  termsAndConditions: string[];
  imageUrls: string[];
  bannerImageUrl?: string;
  bannerInfo?: BannerStandardizationInfo;
  mediaType?: MediaFormatType;
  videoInfo?: VideoMediaInfo;
  promotionalHighlights?: string[];
  suggestedTags?: string[];
  promoCode?: string;
  status: AdvertisementStatus;
  rejectionReason?: string;
  submittedAt: string;
  updatedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  publishedOfferId?: string;
  viewsCount?: number;
  clicksCount?: number;
  conversionsCount?: number;
  auditTrail: AuditLogEntry[];
}

export interface AdvertisementNotification {
  id: string;
  recipientUid: string;
  advertisementId: string;
  advertisementTitle: string;
  type: 'APPROVAL' | 'REJECTION' | 'RESUBMISSION' | 'INFO';
  title: string;
  message: string;
  rejectionReason?: string;
  createdAt: string; // ISO-8601
  isRead: boolean;
}

export interface AdvertisementSubmissionPayload {
  vendorId?: string;
  title: string;
  providerName: string;
  providerContact?: string;
  description: string;
  categoryId: string;
  categoryName: string;
  valueType: OfferValueType;
  value: number;
  currency: 'INR' | 'USD';
  scope: OfferScope;
  location?: OfferLocation;
  validFrom: string;
  validUntil: string;
  termsAndConditions: string[];
  imageUrls?: string[];
  bannerImageUrl?: string;
  bannerInfo?: BannerStandardizationInfo;
  mediaType?: MediaFormatType;
  videoInfo?: VideoMediaInfo;
  promotionalHighlights?: string[];
  suggestedTags?: string[];
  promoCode?: string;
  isDraft?: boolean;
}

