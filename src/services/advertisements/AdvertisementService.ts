/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Advertisement,
  AdvertisementNotification,
  AdvertisementSubmissionPayload,
  AdvertisementStatus,
  AuditLogEntry,
} from '../../domain/models/Advertisement';
import { AuthUser, Offer } from '../../domain/models/Offer';
import { isOfferActiveAndValid } from '../../domain/logic/offerValidity';

const ADS_STORAGE_KEY = 'nearby_offers_advertisements_v1';
const NOTIFICATIONS_STORAGE_KEY = 'nearby_offers_advertiser_notifications_v1';

const MS_PER_HOUR = 3600 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const nowMs = Date.now();
const futureHours = (h: number) => new Date(nowMs + h * MS_PER_HOUR).toISOString();
const pastHours = (h: number) => new Date(nowMs - h * MS_PER_HOUR).toISOString();
const pastDays = (d: number) => new Date(nowMs - d * MS_PER_DAY).toISOString();
const futureDays = (d: number) => new Date(nowMs + d * MS_PER_DAY).toISOString();

// Pre-seeded realistic advertisements demonstrating each stage of the review workflow
const INITIAL_SEED_ADVERTISEMENTS: Advertisement[] = [
  {
    id: 'ad-seed-pending-01',
    advertizerUid: 'demo_user_2233',
    advertizerName: 'Advertizer (2233)',
    advertizerPhone: '9811122233',
    title: '40% Off Artisanal Sourdough & Gourmet Flatbreads',
    providerId: 'prov-bakery-2233',
    providerName: 'Wild Yeast Artisan Boulangerie',
    providerContact: 'contact@wildyeastbakers.in · +91 98111 22233',
    description: 'Slow-fermented artisan sourdough breads, savory flatbreads, and cultured butter spreads crafted fresh each morning.',
    categoryId: 'food-dining',
    categoryName: 'Food & Dining',
    valueType: 'PERCENTAGE',
    value: 40,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Jubilee Hills Check Post',
      address: 'Plot 72, Road No. 36, Jubilee Hills, Hyderabad 500033',
      latitude: 17.4319,
      longitude: 78.4075,
      city: 'Hyderabad',
    },
    validFrom: pastHours(2),
    validUntil: futureDays(7),
    termsAndConditions: [
      'Valid on in-store purchases above ₹350.',
      'One redemption per billing customer per day.',
      'Valid on all signature breads and savory bakes.',
    ],
    imageUrls: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&h=675&q=85'],
    bannerImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&h=675&q=85',
    bannerInfo: {
      originalFileName: 'artisan_sourdough_display.jpg',
      originalFileType: 'image/jpeg',
      originalSizeBytes: 2450000,
      originalDimensions: { width: 3840, height: 2160 },
      standardDimensions: { width: 1200, height: 675 },
      standardSizeBytes: 148200,
      standardFormat: 'image/webp',
      compressionRatioPercent: 93.9,
      cropStrategy: 'cover-center',
      processedAt: pastHours(3),
      isStandardized: true,
    },
    promoCode: 'YEAST40',
    status: 'PENDING_APPROVAL',
    submittedAt: pastHours(3),
    auditTrail: [
      {
        id: 'aud-01',
        action: 'SUBMITTED',
        timestamp: pastHours(3),
        performedByUid: 'demo_user_2233',
        performedByName: 'Advertizer (2233)',
        performedByRole: 'ADVERTIZER',
        notes: 'Initial advertisement submitted with standardized 1200x675 banner.',
      },
    ],
  },
  {
    id: 'ad-seed-pending-02',
    advertizerUid: 'demo_user_3344',
    advertizerName: 'Advertizer (3344)',
    advertizerPhone: '9822233344',
    title: 'Flat ₹500 Instant Discount on Designer Sunglasses',
    providerId: 'prov-optics-3344',
    providerName: 'Luxe Vision Eyewear Boutique',
    providerContact: 'support@luxevision.com · +91 98222 33344',
    description: 'Step out in style with UV400 polarized frames and designer sunglasses from Ray-Ban, Oakley, and Tom Ford.',
    categoryId: 'fashion',
    categoryName: 'Fashion',
    valueType: 'FIXED_AMOUNT',
    value: 500,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Somajiguda Circle',
      address: 'Shop 14, Raj Bhavan Road, Somajiguda, Hyderabad 500082',
      latitude: 17.4241,
      longitude: 78.4552,
      city: 'Hyderabad',
    },
    validFrom: pastHours(1),
    validUntil: futureDays(5),
    termsAndConditions: [
      'Minimum bill value ₹2,500.',
      'Applicable on premium and branded frames.',
      'Must present promo code at the checkout desk.',
    ],
    imageUrls: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&h=675&q=85'],
    bannerImageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&h=675&q=85',
    bannerInfo: {
      originalFileName: 'designer_eyewear_summer.png',
      originalFileType: 'image/png',
      originalSizeBytes: 3120000,
      originalDimensions: { width: 2560, height: 1440 },
      standardDimensions: { width: 1200, height: 675 },
      standardSizeBytes: 162400,
      standardFormat: 'image/webp',
      compressionRatioPercent: 94.8,
      cropStrategy: 'cover-center',
      processedAt: pastHours(1),
      isStandardized: true,
    },
    promoCode: 'LUXEV500',
    status: 'PENDING_APPROVAL',
    submittedAt: pastHours(1),
    auditTrail: [
      {
        id: 'aud-02',
        action: 'SUBMITTED',
        timestamp: pastHours(1),
        performedByUid: 'demo_user_3344',
        performedByName: 'Advertizer (3344)',
        performedByRole: 'ADVERTIZER',
        notes: 'Submitted for weekend shopping carnival with standardized WebP banner.',
      },
    ],
  },
  {
    id: 'ad-seed-approved-03',
    advertizerUid: 'demo_user_2233',
    advertizerName: 'Advertizer (2233)',
    advertizerPhone: '9811122233',
    title: '25% Off Premium Car Detailing & Ceramic Wash',
    providerId: 'prov-detailing-2233',
    providerName: 'Apex Precision Auto Spa',
    providerContact: 'service@apexdetailing.in · +91 98111 22233',
    description: 'Eco-friendly steam wash, 3-stage exterior foam polish, hydrophobic glass coating, and antibacterial interior sanitization.',
    categoryId: 'automotive',
    categoryName: 'Automotive & Services',
    valueType: 'PERCENTAGE',
    value: 25,
    currency: 'INR',
    scope: 'LOCAL',
    location: {
      label: 'Madhapur Main Road',
      address: 'Beside Cyber Towers, Madhapur, Hyderabad 500081',
      latitude: 17.4483,
      longitude: 78.3748,
      city: 'Hyderabad',
    },
    validFrom: pastDays(2),
    validUntil: futureDays(12),
    termsAndConditions: [
      'Appointment booking required 2 hours in advance.',
      'Valid for Hatchbacks, Sedans, and Compact SUVs.',
    ],
    imageUrls: ['https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&h=675&q=85'],
    bannerImageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&h=675&q=85',
    bannerInfo: {
      originalFileName: 'car_detailing_spa.jpg',
      originalFileType: 'image/jpeg',
      originalSizeBytes: 1980000,
      originalDimensions: { width: 1920, height: 1080 },
      standardDimensions: { width: 1200, height: 675 },
      standardSizeBytes: 135800,
      standardFormat: 'image/webp',
      compressionRatioPercent: 93.1,
      cropStrategy: 'cover-center',
      processedAt: pastDays(1),
      isStandardized: true,
    },
    promoCode: 'APEX25',
    status: 'APPROVED',
    submittedAt: pastDays(2),
    reviewedAt: pastDays(1),
    reviewedBy: 'Authorized Admin',
    publishedOfferId: 'pub-off-apex25',
    auditTrail: [
      {
        id: 'aud-03',
        action: 'SUBMITTED',
        timestamp: pastDays(2),
        performedByUid: 'demo_user_2233',
        performedByName: 'Advertizer (2233)',
        performedByRole: 'ADVERTIZER',
        notes: 'Submitted detailing promotion.',
      },
      {
        id: 'aud-04',
        action: 'APPROVED',
        timestamp: pastDays(1),
        performedByUid: 'admin_trusted_root',
        performedByName: 'Authorized Admin',
        performedByRole: 'ADMIN',
        notes: 'Verified merchant location and license. Approved and published.',
      },
    ],
  },
  {
    id: 'ad-seed-rejected-04',
    advertizerUid: 'demo_user_2233',
    advertizerName: 'Advertizer (2233)',
    advertizerPhone: '9811122233',
    title: '85% Off Mega Mystery Clearance Box',
    providerId: 'prov-discount-04',
    providerName: 'Quick Liquidation Deals',
    providerContact: 'contact@bargaindeals.info',
    description: 'Unbox surprise gadgets and clearance fashion items at deep discounts.',
    categoryId: 'electronics',
    categoryName: 'Electronics',
    valueType: 'PERCENTAGE',
    value: 85,
    currency: 'INR',
    scope: 'ONLINE',
    validFrom: pastDays(3),
    validUntil: futureDays(2),
    termsAndConditions: ['No refunds. Goods sold as is.'],
    imageUrls: [],
    status: 'REJECTED',
    rejectionReason: 'Discount claims exceed verified pricing policy without item inventory disclosure. Please specify item breakdown and clear return warranty terms.',
    submittedAt: pastDays(3),
    reviewedAt: pastDays(2),
    reviewedBy: 'Authorized Admin',
    auditTrail: [
      {
        id: 'aud-05',
        action: 'SUBMITTED',
        timestamp: pastDays(3),
        performedByUid: 'demo_user_2233',
        performedByName: 'Advertizer (2233)',
        performedByRole: 'ADVERTIZER',
      },
      {
        id: 'aud-06',
        action: 'REJECTED',
        timestamp: pastDays(2),
        performedByUid: 'admin_trusted_root',
        performedByName: 'Authorized Admin',
        performedByRole: 'ADMIN',
        notes: 'Rejected due to insufficient product disclosure and lack of warranty terms.',
      },
    ],
  },
  {
    id: 'ad-seed-expired-05',
    advertizerUid: 'demo_user_3344',
    advertizerName: 'Advertizer (3344)',
    advertizerPhone: '9822233344',
    title: 'Flash 50% Off Monsoon Rainwear Collection',
    providerId: 'prov-rainwear-05',
    providerName: 'Urban Weatherwear Co.',
    description: 'Waterproof jackets and rain gear clearance.',
    categoryId: 'fashion',
    categoryName: 'Fashion',
    valueType: 'PERCENTAGE',
    value: 50,
    currency: 'INR',
    scope: 'LOCAL',
    validFrom: pastDays(14),
    validUntil: pastDays(1), // Already expired
    termsAndConditions: ['Limited seasonal stock.'],
    imageUrls: [],
    status: 'EXPIRED',
    submittedAt: pastDays(15),
    reviewedAt: pastDays(14),
    reviewedBy: 'Authorized Admin',
    auditTrail: [
      {
        id: 'aud-07',
        action: 'APPROVED',
        timestamp: pastDays(14),
        performedByUid: 'admin_trusted_root',
        performedByName: 'Authorized Admin',
        performedByRole: 'ADMIN',
      },
    ],
  },
];

const INITIAL_SEED_NOTIFICATIONS: AdvertisementNotification[] = [
  {
    id: 'notif-01',
    recipientUid: 'demo_user_2233',
    advertisementId: 'ad-seed-approved-03',
    advertisementTitle: '25% Off Premium Car Detailing & Ceramic Wash',
    type: 'APPROVAL',
    title: 'Advertisement Approved & Published!',
    message: 'Your advertisement "25% Off Premium Car Detailing & Ceramic Wash" has been approved by our review team and is now live on the Offema marketplace.',
    createdAt: pastDays(1),
    isRead: false,
  },
  {
    id: 'notif-02',
    recipientUid: 'demo_user_2233',
    advertisementId: 'ad-seed-rejected-04',
    advertisementTitle: '85% Off Mega Mystery Clearance Box',
    type: 'REJECTION',
    title: 'Submission Requires Revision',
    message: 'Your advertisement "85% Off Mega Mystery Clearance Box" was not approved.',
    rejectionReason: 'Discount claims exceed verified pricing policy without item inventory disclosure. Please specify item breakdown and clear return warranty terms.',
    createdAt: pastDays(2),
    isRead: false,
  },
];

export class AdvertisementService {
  private advertisements: Advertisement[] = [];
  private notifications: AdvertisementNotification[] = [];
  private notificationListeners: Array<(notifications: AdvertisementNotification[]) => void> = [];

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedAds = localStorage.getItem(ADS_STORAGE_KEY);
        if (storedAds) {
          this.advertisements = JSON.parse(storedAds);
        } else {
          this.advertisements = [...INITIAL_SEED_ADVERTISEMENTS];
          this.persistAds();
        }

        const storedNotifs = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (storedNotifs) {
          this.notifications = JSON.parse(storedNotifs);
        } else {
          this.notifications = [...INITIAL_SEED_NOTIFICATIONS];
          this.persistNotifications();
        }
      } else {
        this.advertisements = [...INITIAL_SEED_ADVERTISEMENTS];
        this.notifications = [...INITIAL_SEED_NOTIFICATIONS];
      }
    } catch {
      this.advertisements = [...INITIAL_SEED_ADVERTISEMENTS];
      this.notifications = [...INITIAL_SEED_NOTIFICATIONS];
    }
  }

  private persistAds(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(this.advertisements));
      }
    } catch {
      // storage unavailable
    }
  }

  private persistNotifications(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(this.notifications));
      }
    } catch {
      // storage unavailable
    }
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    for (const listener of this.notificationListeners) {
      listener(this.notifications);
    }
  }

  // --- Advertizer Actions ---

  /**
   * Submits a new advertisement for Admin Approval.
   * Enforces backend role check: user must be an Advertizer or Admin.
   */
  async submitAdvertisement(
    payload: AdvertisementSubmissionPayload,
    user: AuthUser
  ): Promise<Advertisement> {
    if (user.role !== 'ADVERTIZER' && user.role !== 'ADMIN') {
      throw new Error('Permission Denied: Only users with Advertizer role can submit advertisements.');
    }

    // Backend payload validation
    if (!payload.title?.trim()) {
      throw new Error('Advertisement title is required.');
    }
    if (!payload.providerName?.trim()) {
      throw new Error('Business or provider name is required.');
    }
    if (!payload.categoryId) {
      throw new Error('Category selection is required.');
    }
    if (!payload.value || payload.value <= 0) {
      throw new Error('Offer discount value must be greater than zero.');
    }
    if (payload.valueType === 'PERCENTAGE' && payload.value > 100) {
      throw new Error('Percentage discount cannot exceed 100%.');
    }
    if (new Date(payload.validUntil).getTime() <= new Date(payload.validFrom).getTime()) {
      throw new Error('Validity expiration date must be after start date.');
    }

    const adId = `ad-sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      action: 'SUBMITTED',
      timestamp: nowIso,
      performedByUid: user.uid,
      performedByName: user.displayName || user.phoneNumber,
      performedByRole: user.role,
      notes: 'Submitted for Admin review and approval.',
    };

    // Backend Banner Standardization Validation
    if (payload.bannerImageUrl) {
      if (payload.bannerInfo) {
        if (!payload.bannerInfo.isStandardized) {
          throw new Error('Banner processing error: Uploaded banner has not been standardized.');
        }
        if (payload.bannerInfo.standardDimensions.width !== 1200 || payload.bannerInfo.standardDimensions.height !== 675) {
          throw new Error('Banner standardization error: Banner must match required 1200x675 dimensions.');
        }
        if (payload.bannerInfo.standardSizeBytes > 350 * 1024) {
          throw new Error('Banner compression error: Standardized banner size exceeds 300KB limit.');
        }
      }
    }

    const bannerImage = payload.bannerImageUrl || (payload.imageUrls && payload.imageUrls.length > 0 ? payload.imageUrls[0] : undefined);
    const combinedImageUrls = bannerImage
      ? [bannerImage, ...(payload.imageUrls || []).filter((u) => u !== bannerImage)]
      : payload.imageUrls || [];

    const newAd: Advertisement = {
      id: adId,
      advertizerUid: user.uid,
      advertizerName: user.displayName || `Advertizer (${user.phoneNumber.slice(-4)})`,
      advertizerPhone: user.phoneNumber,
      title: payload.title.trim(),
      providerId: `prov-${user.uid}`,
      providerName: payload.providerName.trim(),
      providerContact: payload.providerContact?.trim(),
      description: payload.description.trim(),
      categoryId: payload.categoryId,
      categoryName: payload.categoryName,
      valueType: payload.valueType,
      value: Number(payload.value),
      currency: payload.currency || 'INR',
      scope: payload.scope || 'LOCAL',
      location: payload.location,
      validFrom: payload.validFrom,
      validUntil: payload.validUntil,
      termsAndConditions: payload.termsAndConditions.filter((t) => t.trim().length > 0),
      imageUrls: combinedImageUrls,
      bannerImageUrl: bannerImage,
      bannerInfo: payload.bannerInfo,
      promoCode: payload.promoCode?.trim().toUpperCase(),
      status: 'PENDING_APPROVAL', // Strict initial status
      submittedAt: nowIso,
      auditTrail: [auditEntry],
    };

    this.advertisements = [newAd, ...this.advertisements];
    this.persistAds();

    return newAd;
  }

  /**
   * Updates an existing advertisement.
   * If updated by Advertizer: only their own ads, and resets status to PENDING_APPROVAL (reapproval workflow).
   * If updated by Admin: permitted during review.
   */
  async updateAdvertisement(
    adId: string,
    updates: Partial<AdvertisementSubmissionPayload>,
    user: AuthUser
  ): Promise<Advertisement> {
    const existingIndex = this.advertisements.findIndex((a) => a.id === adId);
    if (existingIndex === -1) {
      throw new Error(`Advertisement not found: ${adId}`);
    }

    const existing = this.advertisements[existingIndex];

    // Backend authorization check
    const isOwner = existing.advertizerUid === user.uid;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new Error('Permission Denied: You can only edit your own advertisements.');
    }

    const nowIso = new Date().toISOString();
    let newStatus: AdvertisementStatus = existing.status;
    let auditAction: AuditLogEntry['action'] = 'EDITED';
    let auditNotes = 'Advertisement updated.';

    // If advertizer edits an approved or rejected ad, it enters reapproval workflow
    if (isOwner && !isAdmin) {
      newStatus = 'PENDING_APPROVAL';
      auditAction = existing.status === 'REJECTED' ? 'RESUBMITTED' : 'EDITED';
      auditNotes =
        existing.status === 'APPROVED'
          ? 'Advertizer modified active offer; submitted for reapproval.'
          : existing.status === 'REJECTED'
          ? 'Advertizer updated rejected offer with revisions for re-review.'
          : 'Advertizer updated pending advertisement details.';
    }

    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      action: auditAction,
      timestamp: nowIso,
      performedByUid: user.uid,
      performedByName: user.displayName || user.phoneNumber,
      performedByRole: user.role,
      notes: auditNotes,
    };

    const updatedAd: Advertisement = {
      ...existing,
      ...updates,
      status: newStatus,
      rejectionReason: newStatus === 'PENDING_APPROVAL' ? undefined : existing.rejectionReason,
      updatedAt: nowIso,
      auditTrail: [...existing.auditTrail, auditEntry],
    };

    this.advertisements[existingIndex] = updatedAd;
    this.persistAds();

    return updatedAd;
  }

  // --- Admin Review Actions ---

  /**
   * Approves an advertisement and immediately publishes it to the marketplace.
   * Enforces backend Admin authorization.
   */
  async approveAdvertisement(
    adId: string,
    adminUser: AuthUser,
    adminNotes?: string
  ): Promise<Advertisement> {
    if (adminUser.role !== 'ADMIN') {
      throw new Error('Security Violation: Only authorized administrators can approve advertisements.');
    }

    const existingIndex = this.advertisements.findIndex((a) => a.id === adId);
    if (existingIndex === -1) {
      throw new Error(`Advertisement not found: ${adId}`);
    }

    const existing = this.advertisements[existingIndex];
    const nowIso = new Date().toISOString();
    const publishedOfferId = `pub-off-${existing.id}`;

    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      action: 'APPROVED',
      timestamp: nowIso,
      performedByUid: adminUser.uid,
      performedByName: adminUser.displayName || 'Administrator',
      performedByRole: 'ADMIN',
      notes: adminNotes?.trim() || 'Reviewed and approved by Admin. Published to live catalog.',
    };

    const approvedAd: Advertisement = {
      ...existing,
      status: 'APPROVED',
      rejectionReason: undefined,
      reviewedAt: nowIso,
      reviewedBy: adminUser.displayName || 'Authorized Admin',
      publishedOfferId,
      auditTrail: [...existing.auditTrail, auditEntry],
    };

    this.advertisements[existingIndex] = approvedAd;
    this.persistAds();

    // Create real-time notification for Advertizer
    const notification: AdvertisementNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      recipientUid: existing.advertizerUid,
      advertisementId: existing.id,
      advertisementTitle: existing.title,
      type: 'APPROVAL',
      title: 'Advertisement Approved & Live!',
      message: `Your advertisement "${existing.title}" was reviewed and approved by the admin. It is now published and visible to users browsing nearby and global offers.`,
      createdAt: nowIso,
      isRead: false,
    };

    this.notifications = [notification, ...this.notifications];
    this.persistNotifications();

    return approvedAd;
  }

  /**
   * Rejects an advertisement with a mandatory rejection reason.
   * Enforces backend Admin authorization.
   */
  async rejectAdvertisement(
    adId: string,
    reason: string,
    adminUser: AuthUser
  ): Promise<Advertisement> {
    if (adminUser.role !== 'ADMIN') {
      throw new Error('Security Violation: Only authorized administrators can reject advertisements.');
    }

    if (!reason || reason.trim().length < 5) {
      throw new Error('A detailed rejection reason (minimum 5 characters) is required when rejecting.');
    }

    const existingIndex = this.advertisements.findIndex((a) => a.id === adId);
    if (existingIndex === -1) {
      throw new Error(`Advertisement not found: ${adId}`);
    }

    const existing = this.advertisements[existingIndex];
    const nowIso = new Date().toISOString();

    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      action: 'REJECTED',
      timestamp: nowIso,
      performedByUid: adminUser.uid,
      performedByName: adminUser.displayName || 'Administrator',
      performedByRole: 'ADMIN',
      notes: `Rejected with reason: "${reason.trim()}"`,
    };

    const rejectedAd: Advertisement = {
      ...existing,
      status: 'REJECTED',
      rejectionReason: reason.trim(),
      reviewedAt: nowIso,
      reviewedBy: adminUser.displayName || 'Authorized Admin',
      auditTrail: [...existing.auditTrail, auditEntry],
    };

    this.advertisements[existingIndex] = rejectedAd;
    this.persistAds();

    // Create notification for Advertizer
    const notification: AdvertisementNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      recipientUid: existing.advertizerUid,
      advertisementId: existing.id,
      advertisementTitle: existing.title,
      type: 'REJECTION',
      title: 'Advertisement Submission Rejected',
      message: `Your advertisement "${existing.title}" was reviewed and rejected.`,
      rejectionReason: reason.trim(),
      createdAt: nowIso,
      isRead: false,
    };

    this.notifications = [notification, ...this.notifications];
    this.persistNotifications();

    return rejectedAd;
  }

  // --- Querying & RBAC Access ---

  /**
   * Returns all advertisements for the Admin Dashboard.
   * Enforces Admin role check on the backend.
   */
  async getAdvertisementsForAdmin(
    adminUser: AuthUser,
    filters?: {
      status?: AdvertisementStatus | 'ALL';
      categoryId?: string;
      search?: string;
      advertizerUid?: string;
    }
  ): Promise<Advertisement[]> {
    if (adminUser.role !== 'ADMIN') {
      throw new Error('Security Violation: Admin Dashboard access is restricted to authorized administrators.');
    }

    let results = [...this.advertisements];

    // Auto-update expired status for display accuracy
    const now = new Date();
    results = results.map((ad) => {
      if (ad.status === 'APPROVED' && new Date(ad.validUntil) < now) {
        return { ...ad, status: 'EXPIRED' as const };
      }
      return ad;
    });

    if (filters?.status && filters.status !== 'ALL') {
      results = results.filter((a) => a.status === filters.status);
    }
    if (filters?.categoryId && filters.categoryId !== 'ALL') {
      results = results.filter((a) => a.categoryId === filters.categoryId);
    }
    if (filters?.advertizerUid) {
      results = results.filter((a) => a.advertizerUid === filters.advertizerUid);
    }
    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.providerName.toLowerCase().includes(q) ||
          a.advertizerName.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.promoCode?.toLowerCase().includes(q)
      );
    }

    return results;
  }

  /**
   * Returns advertisements belonging exclusively to the authenticated Advertizer.
   */
  async getAdvertisementsForAdvertizer(user: AuthUser): Promise<Advertisement[]> {
    // Return only ads owned by this user
    const userAds = this.advertisements.filter((a) => a.advertizerUid === user.uid);
    const now = new Date();
    return userAds.map((ad) => {
      if (ad.status === 'APPROVED' && new Date(ad.validUntil) < now) {
        return { ...ad, status: 'EXPIRED' as const };
      }
      return ad;
    });
  }

  /**
   * Converts approved, active advertisements into live Offer objects for users.
   * Pending and rejected ads are STRICTLY excluded.
   */
  async getApprovedPublishedOffers(): Promise<Offer[]> {
    const now = new Date();
    const approvedAds = this.advertisements.filter(
      (ad) => ad.status === 'APPROVED' && new Date(ad.validUntil) > now
    );

    return approvedAds.map((ad) => {
      const offer: Offer = {
        id: ad.publishedOfferId || `pub-off-${ad.id}`,
        title: ad.title,
        providerId: ad.providerId,
        providerName: ad.providerName,
        description: ad.description,
        categoryId: ad.categoryId,
        categoryName: ad.categoryName,
        valueType: ad.valueType,
        value: ad.value,
        currency: ad.currency,
        scope: ad.scope,
        location: ad.location,
        validFrom: ad.validFrom,
        validUntil: ad.validUntil,
        termsAndConditions: ad.termsAndConditions,
        imageUrls: ad.imageUrls,
        bannerImageUrl: ad.bannerImageUrl || (ad.imageUrls && ad.imageUrls.length > 0 ? ad.imageUrls[0] : undefined),
        bannerInfo: ad.bannerInfo,
        isActive: true,
        promoCode: ad.promoCode,
        rankingScore: 90, // Freshly approved merchant offer
      };
      return offer;
    });
  }

  /**
   * Returns all advertisements for a specific vendor profile ID.
   */
  async getAllAdvertisementsForVendor(vendorId: string): Promise<Advertisement[]> {
    return this.advertisements.filter((a) => a.vendorId === vendorId || a.advertizerUid === vendorId);
  }

  /**
   * Delete advertisement (Vendor can delete their own DRAFT/REJECTED/EXPIRED ads; Admin can delete any)
   */
  async deleteAdvertisement(adId: string, user: AuthUser): Promise<boolean> {
    const index = this.advertisements.findIndex((a) => a.id === adId);
    if (index === -1) {
      throw new Error(`Advertisement not found: ${adId}`);
    }

    const ad = this.advertisements[index];
    const isOwner = ad.advertizerUid === user.uid;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new Error('Unauthorized: You cannot delete advertisements belonging to another vendor.');
    }

    if (isOwner && !isAdmin && ad.status === 'APPROVED') {
      throw new Error('Published live advertisements cannot be deleted directly. Request deactivation or pause first.');
    }

    this.advertisements.splice(index, 1);
    this.persistAds();
    return true;
  }

  /**
   * Validates video upload file (size limit: 50MB, allowed types: MP4, WebM, MOV)
   */
  validateVideoFile(file: { type: string; size: number; name?: string }): { valid: boolean; error?: string } {
    if (!file) return { valid: false, error: 'No video file provided.' };
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
    if (!allowed.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: `Unsupported video format (${file.type}). Supported formats are MP4, WebM, and MOV.`,
      };
    }
    const maxBytes = 50 * 1024 * 1024; // 50MB
    if (file.size > maxBytes) {
      return {
        valid: false,
        error: `Video size exceeds 50MB maximum upload limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
      };
    }
    return { valid: true };
  }

  /**
   * Track ad impression / view
   */
  async recordAdView(adId: string): Promise<void> {
    const ad = this.advertisements.find((a) => a.id === adId || a.publishedOfferId === adId);
    if (ad) {
      ad.viewsCount = (ad.viewsCount || 0) + 1;
      this.persistAds();
    }
  }

  /**
   * Track ad click
   */
  async recordAdClick(adId: string): Promise<void> {
    const ad = this.advertisements.find((a) => a.id === adId || a.publishedOfferId === adId);
    if (ad) {
      ad.clicksCount = (ad.clicksCount || 0) + 1;
      this.persistAds();
    }
  }

  /**
   * Track ad conversion (code copy / checkout redemption)
   */
  async recordAdConversion(adId: string): Promise<void> {
    const ad = this.advertisements.find((a) => a.id === adId || a.publishedOfferId === adId);
    if (ad) {
      ad.conversionsCount = (ad.conversionsCount || 0) + 1;
      this.persistAds();
    }
  }

  // --- Notifications ---

  async getNotifications(user: AuthUser): Promise<AdvertisementNotification[]> {
    return this.notifications.filter((n) => n.recipientUid === user.uid);
  }

  async markNotificationAsRead(notificationId: string, user: AuthUser): Promise<void> {
    this.notifications = this.notifications.map((n) =>
      n.id === notificationId && n.recipientUid === user.uid ? { ...n, isRead: true } : n
    );
    this.persistNotifications();
  }

  async markAllNotificationsAsRead(user: AuthUser): Promise<void> {
    this.notifications = this.notifications.map((n) =>
      n.recipientUid === user.uid ? { ...n, isRead: true } : n
    );
    this.persistNotifications();
  }

  onNotificationsChanged(
    user: AuthUser,
    callback: (notifications: AdvertisementNotification[]) => void
  ): () => void {
    const handler = () => {
      callback(this.notifications.filter((n) => n.recipientUid === user.uid));
    };
    this.notificationListeners.push(handler);
    handler(); // Initial trigger
    return () => {
      this.notificationListeners = this.notificationListeners.filter((l) => l !== handler);
    };
  }
}

export const advertisementService = new AdvertisementService();
