/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateBannerFile,
  calculateCoverCrop,
  formatBytes,
  STANDARD_BANNER_WIDTH,
  STANDARD_BANNER_HEIGHT,
  MAX_RAW_UPLOAD_BYTES,
  STANDARD_TARGET_MAX_BYTES,
} from '../services/image/BannerStandardizer';
import { AdvertisementService } from '../services/advertisements/AdvertisementService';
import { AuthUser } from '../domain/models/Offer';
import { AdvertisementSubmissionPayload } from '../domain/models/Advertisement';

describe('Banner Standardizer & Automatic Image Processing', () => {
  it('validates standard dimensions and aspect ratio constants', () => {
    expect(STANDARD_BANNER_WIDTH).toBe(1200);
    expect(STANDARD_BANNER_HEIGHT).toBe(675);
    // 1200 / 675 is exactly 16:9
    expect(STANDARD_BANNER_WIDTH / STANDARD_BANNER_HEIGHT).toBeCloseTo(16 / 9, 3);
    expect(STANDARD_TARGET_MAX_BYTES).toBe(300 * 1024);
    expect(MAX_RAW_UPLOAD_BYTES).toBe(10 * 1024 * 1024);
  });

  describe('validateBannerFile', () => {
    it('accepts valid supported image MIME types under size limit', () => {
      const validJpeg = { type: 'image/jpeg', size: 2 * 1024 * 1024, name: 'photo.jpg' };
      const validPng = { type: 'image/png', size: 5 * 1024 * 1024, name: 'banner.png' };
      const validWebp = { type: 'image/webp', size: 500 * 1024, name: 'promo.webp' };
      const validGif = { type: 'image/gif', size: 1024 * 1024, name: 'animation.gif' };

      expect(validateBannerFile(validJpeg).valid).toBe(true);
      expect(validateBannerFile(validPng).valid).toBe(true);
      expect(validateBannerFile(validWebp).valid).toBe(true);
      expect(validateBannerFile(validGif).valid).toBe(true);
    });

    it('rejects unsupported file formats with clear error description', () => {
      const pdf = { type: 'application/pdf', size: 1024 * 1024, name: 'document.pdf' };
      const resultPdf = validateBannerFile(pdf);
      expect(resultPdf.valid).toBe(false);
      expect(resultPdf.error).toContain('Unsupported format');

      const txt = { type: 'text/plain', size: 500, name: 'notes.txt' };
      const resultTxt = validateBannerFile(txt);
      expect(resultTxt.valid).toBe(false);
      expect(resultTxt.error).toContain('Unsupported format');
    });

    it('rejects files exceeding the 10MB raw upload limit', () => {
      const oversized = {
        type: 'image/jpeg',
        size: 11 * 1024 * 1024, // 11 MB
        name: 'huge_photo.jpg',
      };
      const result = validateBannerFile(oversized);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum upload limit of 10 MB');
    });

    it('rejects empty files with 0 bytes', () => {
      const emptyFile = { type: 'image/png', size: 0, name: 'empty.png' };
      const result = validateBannerFile(emptyFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('0 bytes');
    });
  });

  describe('calculateCoverCrop', () => {
    it('calculates center horizontal crop for ultra-wide source images', () => {
      // Source is 2400 x 1000 (aspect 2.4, wider than 16:9 = 1.777)
      const crop = calculateCoverCrop(2400, 1000, 1200, 675);
      expect(crop.targetWidth).toBe(1200);
      expect(crop.targetHeight).toBe(675);
      // sx should be > 0 (centered) and sy should be 0
      expect(crop.sx).toBeGreaterThan(0);
      expect(crop.sy).toBe(0);
      expect(crop.sHeight).toBe(1000);
    });

    it('calculates center vertical crop for tall/square source images', () => {
      // Source is square 2000 x 2000 (aspect 1.0, taller than 16:9)
      const crop = calculateCoverCrop(2000, 2000, 1200, 675);
      expect(crop.targetWidth).toBe(1200);
      expect(crop.targetHeight).toBe(675);
      // sy should be > 0 (centered top/bottom) and sx should be 0
      expect(crop.sx).toBe(0);
      expect(crop.sy).toBeGreaterThan(0);
      expect(crop.sWidth).toBe(2000);
    });

    it('returns exact dimensions when source is already 16:9 aspect ratio', () => {
      const crop = calculateCoverCrop(1920, 1080, 1200, 675);
      expect(crop.sx).toBe(0);
      expect(crop.sy).toBe(0);
      expect(crop.sWidth).toBe(1920);
      expect(crop.sHeight).toBe(1080);
    });
  });

  describe('formatBytes', () => {
    it('formats bytes into readable labels', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(512)).toBe('512 B');
      expect(formatBytes(150 * 1024)).toBe('150.0 KB');
      expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.50 MB');
    });
  });

  describe('Advertisement Workflow with Standardized Banners', () => {
    let adService: AdvertisementService;

    const mockAdvertizer: AuthUser = {
      uid: 'adv-banner-user',
      phoneNumber: '9811122233',
      countryCode: '+91',
      displayName: 'Artisan Cafe',
      createdAt: new Date().toISOString(),
      isDemoUser: true,
      role: 'ADVERTIZER',
    };

    const mockAdmin: AuthUser = {
      uid: 'admin-root',
      phoneNumber: '9999999999',
      countryCode: '+91',
      displayName: 'Authorized Admin',
      createdAt: new Date().toISOString(),
      isDemoUser: true,
      role: 'ADMIN',
    };

    beforeEach(() => {
      adService = new AdvertisementService();
    });

    it('submits advertisement with standardized banner metadata and preserves 1200x675 specs', async () => {
      const payloadWithBanner: AdvertisementSubmissionPayload = {
        title: '30% Off Artisanal Brews & Pastries',
        providerName: 'Artisan Cafe',
        description: 'Single-origin brews and sourdough croissants.',
        categoryId: 'food-dining',
        categoryName: 'Food & Dining',
        valueType: 'PERCENTAGE',
        value: 30,
        currency: 'INR',
        scope: 'LOCAL',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        termsAndConditions: ['Valid on all dine-in beverages.'],
        bannerImageUrl: 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoFAAMAAUAmJaQAA3AA/v39gAA=',
        bannerInfo: {
          originalFileName: 'high_res_photo.jpg',
          originalFileType: 'image/jpeg',
          originalSizeBytes: 4200000,
          originalDimensions: { width: 3840, height: 2160 },
          standardDimensions: { width: 1200, height: 675 },
          standardSizeBytes: 142000,
          standardFormat: 'image/webp',
          compressionRatioPercent: 96.6,
          cropStrategy: 'cover-center',
          processedAt: new Date().toISOString(),
          isStandardized: true,
        },
      };

      const ad = await adService.submitAdvertisement(payloadWithBanner, mockAdvertizer);

      expect(ad.bannerImageUrl).toBe(payloadWithBanner.bannerImageUrl);
      expect(ad.bannerInfo?.isStandardized).toBe(true);
      expect(ad.bannerInfo?.standardDimensions.width).toBe(1200);
      expect(ad.bannerInfo?.standardDimensions.height).toBe(675);
      expect(ad.status).toBe('PENDING_APPROVAL');

      // Admin approves advertisement
      const approved = await adService.approveAdvertisement(ad.id, mockAdmin, 'Verified 1200x675 standardized banner.');
      expect(approved.status).toBe('APPROVED');

      // Check published offer
      const publishedOffers = await adService.getApprovedPublishedOffers();
      const matchingOffer = publishedOffers.find((o) => o.id === approved.publishedOfferId);
      expect(matchingOffer).toBeDefined();
      expect(matchingOffer?.bannerImageUrl).toBe(payloadWithBanner.bannerImageUrl);
      expect(matchingOffer?.bannerInfo?.standardDimensions.width).toBe(1200);
    });

    it('rejects attempt to submit non-standardized banner dimensions', async () => {
      const invalidDimensionsPayload: AdvertisementSubmissionPayload = {
        title: 'Discount with bad banner',
        providerName: 'Test Provider',
        description: 'Test description',
        categoryId: 'food-dining',
        categoryName: 'Food & Dining',
        valueType: 'PERCENTAGE',
        value: 10,
        currency: 'INR',
        scope: 'LOCAL',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        termsAndConditions: ['Terms'],
        bannerImageUrl: 'data:image/jpeg;base64,rawdata',
        bannerInfo: {
          originalFileName: 'bad.jpg',
          originalFileType: 'image/jpeg',
          originalSizeBytes: 1000,
          originalDimensions: { width: 500, height: 500 },
          standardDimensions: { width: 500, height: 500 }, // Violates 1200x675
          standardSizeBytes: 1000,
          standardFormat: 'image/jpeg',
          compressionRatioPercent: 0,
          cropStrategy: 'cover-center',
          processedAt: new Date().toISOString(),
          isStandardized: true,
        },
      };

      await expect(
        adService.submitAdvertisement(invalidDimensionsPayload, mockAdvertizer)
      ).rejects.toThrow('Banner standardization error: Banner must match required 1200x675 dimensions.');
    });
  });
});
