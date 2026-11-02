/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  VendorProfile,
  CreateVendorPayload,
  UpdateVendorPayload,
  VendorAnalytics,
  VendorDailyMetric,
  OnboardingStep,
} from '../../domain/models/Vendor';
import { AuthUser } from '../../domain/models/Offer';
import { userService } from '../users/UserService';
import { advertisementService } from '../advertisements/AdvertisementService';

const VENDORS_STORAGE_KEY = 'nearby_offers_vendors_v1';
const VENDOR_ANALYTICS_STORAGE_KEY = 'nearby_offers_vendor_analytics_v1';

const SEED_VENDORS: VendorProfile[] = [
  {
    id: 'vendor_wild_yeast',
    userId: 'demo_user_2233',
    businessName: 'Wild Yeast Artisan Boulangerie',
    legalEntityName: 'Wild Yeast Bakers LLP',
    category: 'food-dining',
    contactPhone: '+91 98111 22233',
    contactEmail: 'contact@wildyeastbakers.in',
    address: 'Plot 72, Road No. 36, Jubilee Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.4319,
    longitude: 78.4075,
    status: 'ACTIVE',
    onboardingStatus: 'COMPLETED',
    onboardingProgress: 100,
    registrationDate: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z',
    verifiedAt: '2026-02-16T10:00:00.000Z',
    verificationBadge: true,
    bannerImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&h=675&q=85',
    description: 'European-style artisan boulangerie specializing in naturally leavened sourdough, buttery croissants, and seasonal fruit tarts.',
    operatingHours: '07:30 AM - 10:00 PM (All Days)',
  },
  {
    id: 'vendor_luxe_vision',
    userId: 'demo_user_3344',
    businessName: 'Luxe Vision Eyewear Boutique',
    legalEntityName: 'Luxe Vision Optical Private Limited',
    category: 'fashion',
    contactPhone: '+91 98222 33344',
    contactEmail: 'support@luxevision.com',
    address: 'Shop 14, Inorbit Mall, Hitec City',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.4348,
    longitude: 78.3868,
    status: 'ACTIVE',
    onboardingStatus: 'COMPLETED',
    onboardingProgress: 100,
    registrationDate: '2026-03-10T11:20:00.000Z',
    updatedAt: '2026-03-10T11:20:00.000Z',
    verifiedAt: '2026-03-12T14:00:00.000Z',
    verificationBadge: true,
    bannerImageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&h=675&q=85',
    description: 'Authorized retailer of luxury eyewear, prescription polarized lenses, and designer frames from Milan and Paris.',
    operatingHours: '10:30 AM - 09:30 PM (All Days)',
  },
];

// Helper to seed vendor analytics
function generateSeedAnalytics(vendorId: string, businessName: string): VendorAnalytics {
  const now = Date.now();
  const dailyTrends: VendorDailyMetric[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 3600 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const views = Math.floor(180 + Math.random() * 120);
    const clicks = Math.floor(views * (0.12 + Math.random() * 0.08));
    const engagements = Math.floor(clicks * 0.45);
    const conversions = Math.floor(clicks * 0.22);

    dailyTrends.push({
      date: dateStr,
      views,
      clicks,
      engagements,
      conversions,
    });
  }

  const totalViews = dailyTrends.reduce((sum, item) => sum + item.views, 1250);
  const totalClicks = dailyTrends.reduce((sum, item) => sum + item.clicks, 168);
  const totalEngagements = dailyTrends.reduce((sum, item) => sum + item.engagements, 76);
  const totalConversions = dailyTrends.reduce((sum, item) => sum + item.conversions, 38);

  return {
    vendorId,
    businessName,
    totalAdvertisements: 3,
    publishedCount: 1,
    pendingCount: 1,
    draftCount: 1,
    rejectedCount: 0,
    expiredCount: 0,
    totalViews,
    totalClicks,
    totalEngagements,
    totalConversions,
    clickThroughRatePercent: Number(((totalClicks / totalViews) * 100).toFixed(1)),
    conversionRatePercent: Number(((totalConversions / totalClicks) * 100).toFixed(1)),
    dailyTrends,
    lastUpdated: new Date().toISOString(),
  };
}

export class VendorService {
  private vendors: VendorProfile[] = [];
  private analyticsStore: Map<string, VendorAnalytics> = new Map();

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedVendors = localStorage.getItem(VENDORS_STORAGE_KEY);
        if (storedVendors) {
          this.vendors = JSON.parse(storedVendors);
        } else {
          this.vendors = [...SEED_VENDORS];
          this.persistVendors();
        }

        const storedAnalytics = localStorage.getItem(VENDOR_ANALYTICS_STORAGE_KEY);
        if (storedAnalytics) {
          const parsed = JSON.parse(storedAnalytics) as Record<string, VendorAnalytics>;
          Object.entries(parsed).forEach(([k, v]) => this.analyticsStore.set(k, v));
        } else {
          this.vendors.forEach((v) => {
            this.analyticsStore.set(v.id, generateSeedAnalytics(v.id, v.businessName));
          });
          this.persistAnalytics();
        }
      } else {
        this.vendors = [...SEED_VENDORS];
        this.vendors.forEach((v) => {
          this.analyticsStore.set(v.id, generateSeedAnalytics(v.id, v.businessName));
        });
      }
    } catch {
      this.vendors = [...SEED_VENDORS];
    }
  }

  private persistVendors(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(this.vendors));
      }
    } catch {
      // storage unavailable
    }
  }

  private persistAnalytics(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const obj: Record<string, VendorAnalytics> = {};
        this.analyticsStore.forEach((v, k) => {
          obj[k] = v;
        });
        localStorage.setItem(VENDOR_ANALYTICS_STORAGE_KEY, JSON.stringify(obj));
      }
    } catch {
      // storage unavailable
    }
  }

  /**
   * Complete Vendor Registration & Onboarding Initiation Workflow:
   * 1. Validates business details.
   * 2. Associates with existing User (or updates User role to ADVERTIZER).
   * 3. Creates Vendor profile with initial onboarding status.
   * 4. Initializes baseline analytics.
   * 5. Atomically commits changes.
   */
  async registerVendor(payload: CreateVendorPayload, actor: AuthUser): Promise<VendorProfile> {
    if (!payload.businessName?.trim()) {
      throw new Error('Business name is required.');
    }
    if (!payload.contactPhone?.trim()) {
      throw new Error('Contact phone number is required.');
    }
    if (!payload.category?.trim()) {
      throw new Error('Business category is required.');
    }

    // Check if user already has an active vendor profile
    const existing = this.vendors.find((v) => v.userId === payload.userId && v.status !== 'DEACTIVATED');
    if (existing) {
      return existing;
    }

    const nowIso = new Date().toISOString();
    const vendorId = `vendor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newVendor: VendorProfile = {
      id: vendorId,
      userId: payload.userId,
      businessName: payload.businessName.trim(),
      legalEntityName: payload.legalEntityName?.trim(),
      category: payload.category,
      contactPhone: payload.contactPhone.trim(),
      contactEmail: payload.contactEmail?.trim() || `${payload.businessName.toLowerCase().replace(/\s+/g, '')}@business.local`,
      address: payload.address?.trim() || 'Road No. 36, Jubilee Hills',
      city: payload.city?.trim() || 'Hyderabad',
      state: payload.state?.trim() || 'Telangana',
      country: payload.country?.trim() || 'India',
      latitude: payload.latitude || 17.4319,
      longitude: payload.longitude || 78.4075,
      status: 'ACTIVE',
      onboardingStatus: 'REGISTERED',
      onboardingProgress: 25,
      registrationDate: nowIso,
      updatedAt: nowIso,
      verificationBadge: false,
      bannerImageUrl: payload.bannerImageUrl,
      logoUrl: payload.logoUrl,
      description: payload.description,
    };

    // Atomic association: update user profile
    await userService.setVendorId(payload.userId, vendorId);

    // Initialize analytics
    const initialAnalytics: VendorAnalytics = {
      vendorId,
      businessName: newVendor.businessName,
      totalAdvertisements: 0,
      publishedCount: 0,
      pendingCount: 0,
      draftCount: 0,
      rejectedCount: 0,
      expiredCount: 0,
      totalViews: 0,
      totalClicks: 0,
      totalEngagements: 0,
      totalConversions: 0,
      clickThroughRatePercent: 0,
      conversionRatePercent: 0,
      dailyTrends: [],
      lastUpdated: nowIso,
    };

    this.vendors.unshift(newVendor);
    this.analyticsStore.set(vendorId, initialAnalytics);

    this.persistVendors();
    this.persistAnalytics();

    return newVendor;
  }

  /**
   * Get vendor by vendor ID
   */
  async getVendorById(vendorId: string): Promise<VendorProfile | null> {
    const vendor = this.vendors.find((v) => v.id === vendorId);
    return vendor ? { ...vendor } : null;
  }

  /**
   * Get vendor profile associated with a specific user ID
   */
  async getVendorByUserId(userId: string): Promise<VendorProfile | null> {
    const vendor = this.vendors.find((v) => v.userId === userId && v.status !== 'DEACTIVATED');
    return vendor ? { ...vendor } : null;
  }

  /**
   * List vendors with search, category filtering, and status filtering
   */
  async listVendors(criteria: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ items: VendorProfile[]; total: number }> {
    let filtered = [...this.vendors];

    if (criteria.status && criteria.status !== 'ALL') {
      filtered = filtered.filter((v) => v.status === criteria.status);
    }

    if (criteria.category && criteria.category !== 'ALL') {
      filtered = filtered.filter((v) => v.category === criteria.category);
    }

    if (criteria.search?.trim()) {
      const q = criteria.search.trim().toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.businessName.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.contactEmail.toLowerCase().includes(q) ||
          v.contactPhone.includes(q)
      );
    }

    const page = Math.max(1, criteria.page || 1);
    const limit = Math.max(1, Math.min(100, criteria.limit || 20));
    const start = (page - 1) * limit;

    return {
      items: filtered.slice(start, start + limit),
      total: filtered.length,
    };
  }

  /**
   * Update vendor details (RBAC: vendor owner or Admin)
   */
  async updateVendor(
    vendorId: string,
    updates: UpdateVendorPayload,
    actor: AuthUser
  ): Promise<VendorProfile> {
    const index = this.vendors.findIndex((v) => v.id === vendorId);
    if (index === -1) {
      throw new Error(`Vendor with ID ${vendorId} not found.`);
    }

    const target = this.vendors[index];

    // RBAC: Vendor owner or Admin
    if (actor.role !== 'ADMIN' && target.userId !== actor.uid) {
      throw new Error('Unauthorized: You can only modify your own vendor profile.');
    }

    // Status change restriction: only Admin can change verification/suspension status
    if (updates.status && updates.status !== target.status && actor.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only administrators can update vendor status.');
    }

    const updated: VendorProfile = {
      ...target,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.vendors[index] = updated;
    this.persistVendors();

    // If business name changed, update in analytics
    if (updates.businessName) {
      const analytics = this.analyticsStore.get(vendorId);
      if (analytics) {
        analytics.businessName = updates.businessName;
        this.analyticsStore.set(vendorId, analytics);
        this.persistAnalytics();
      }
    }

    return updated;
  }

  /**
   * Update onboarding step and progress percentage
   */
  async updateOnboardingProgress(
    vendorId: string,
    step: OnboardingStep,
    progress: number
  ): Promise<VendorProfile> {
    const index = this.vendors.findIndex((v) => v.id === vendorId);
    if (index === -1) {
      throw new Error(`Vendor with ID ${vendorId} not found.`);
    }

    this.vendors[index].onboardingStatus = step;
    this.vendors[index].onboardingProgress = Math.min(100, Math.max(0, progress));
    this.vendors[index].updatedAt = new Date().toISOString();

    this.persistVendors();
    return { ...this.vendors[index] };
  }

  /**
   * Deactivate vendor (Admin or owner)
   */
  async deactivateVendor(vendorId: string, actor: AuthUser): Promise<VendorProfile> {
    const index = this.vendors.findIndex((v) => v.id === vendorId);
    if (index === -1) {
      throw new Error(`Vendor with ID ${vendorId} not found.`);
    }

    const target = this.vendors[index];
    if (actor.role !== 'ADMIN' && target.userId !== actor.uid) {
      throw new Error('Unauthorized: You can only deactivate your own vendor account.');
    }

    target.status = 'DEACTIVATED';
    target.updatedAt = new Date().toISOString();
    this.vendors[index] = target;
    this.persistVendors();

    return target;
  }

  /**
   * Delete vendor (Admin only)
   */
  async deleteVendor(vendorId: string, actor: AuthUser): Promise<boolean> {
    if (actor.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only administrators can permanently delete vendor records.');
    }

    const index = this.vendors.findIndex((v) => v.id === vendorId);
    if (index === -1) {
      throw new Error(`Vendor with ID ${vendorId} not found.`);
    }

    this.vendors.splice(index, 1);
    this.analyticsStore.delete(vendorId);
    this.persistVendors();
    this.persistAnalytics();

    return true;
  }

  /**
   * Retrieve vendor performance analytics
   */
  async getVendorAnalytics(vendorId: string, actor: AuthUser): Promise<VendorAnalytics> {
    const vendor = await this.getVendorById(vendorId);
    if (!vendor) {
      throw new Error(`Vendor with ID ${vendorId} not found.`);
    }

    if (actor.role !== 'ADMIN' && vendor.userId !== actor.uid) {
      throw new Error('Unauthorized: You cannot access analytics for another vendor.');
    }

    // Refresh live ad counts from advertisementService
    const ads = await advertisementService.getAllAdvertisementsForVendor(vendorId);
    const publishedCount = ads.filter((a) => a.status === 'APPROVED').length;
    const pendingCount = ads.filter((a) => a.status === 'PENDING_APPROVAL').length;
    const draftCount = ads.filter((a) => a.status === 'DRAFT').length;
    const rejectedCount = ads.filter((a) => a.status === 'REJECTED').length;
    const expiredCount = ads.filter((a) => a.status === 'EXPIRED').length;

    let analytics = this.analyticsStore.get(vendorId);
    if (!analytics) {
      analytics = generateSeedAnalytics(vendorId, vendor.businessName);
      this.analyticsStore.set(vendorId, analytics);
      this.persistAnalytics();
    }

    analytics.totalAdvertisements = ads.length;
    analytics.publishedCount = publishedCount;
    analytics.pendingCount = pendingCount;
    analytics.draftCount = draftCount;
    analytics.rejectedCount = rejectedCount;
    analytics.expiredCount = expiredCount;

    return { ...analytics };
  }

  /**
   * Track real vendor interaction event: VIEW, CLICK, ENGAGE, CONVERT
   */
  async recordVendorEvent(
    vendorId: string,
    eventType: 'VIEW' | 'CLICK' | 'ENGAGE' | 'CONVERT'
  ): Promise<void> {
    let analytics = this.analyticsStore.get(vendorId);
    if (!analytics) {
      const vendor = await this.getVendorById(vendorId);
      if (!vendor) return;
      analytics = generateSeedAnalytics(vendorId, vendor.businessName);
    }

    if (eventType === 'VIEW') {
      analytics.totalViews++;
    } else if (eventType === 'CLICK') {
      analytics.totalClicks++;
    } else if (eventType === 'ENGAGE') {
      analytics.totalEngagements++;
    } else if (eventType === 'CONVERT') {
      analytics.totalConversions++;
    }

    if (analytics.totalViews > 0) {
      analytics.clickThroughRatePercent = Number(((analytics.totalClicks / analytics.totalViews) * 100).toFixed(1));
    }
    if (analytics.totalClicks > 0) {
      analytics.conversionRatePercent = Number(((analytics.totalConversions / analytics.totalClicks) * 100).toFixed(1));
    }

    analytics.lastUpdated = new Date().toISOString();
    this.analyticsStore.set(vendorId, analytics);
    this.persistAnalytics();
  }
}

export const vendorService = new VendorService();
