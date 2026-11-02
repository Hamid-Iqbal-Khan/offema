/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiOfferOnboardingService, AIOfferInput } from '../services/ai/AIOfferOnboardingService';

describe('AIOfferOnboardingService - Intelligent Copilot for Vendor Campaigns', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('generates a structured offer draft with discount extraction via fallback when fetch fails', async () => {
    // Mock fetch to simulate offline / server-side route unavailable
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const input: AIOfferInput = {
      businessName: 'Gelato Artisans',
      category: 'food-dining',
      conceptNotes: 'We want to give 35% discount on all artisan scoops every weekend afternoon.',
      targetAudienceHint: 'Families and dessert lovers',
    };

    const result = await aiOfferOnboardingService.generateOfferDraft(input);

    expect(result).toBeDefined();
    expect(result.offerDraft).toBeDefined();
    expect(result.offerDraft.providerName).toBe('Gelato Artisans');
    expect(result.offerDraft.valueType).toBe('PERCENTAGE');
    expect(result.offerDraft.value).toBe(35);
    expect(result.offerDraft.title).toContain('35% Off');
    expect(result.promotionalHighlights.length).toBeGreaterThan(0);
    expect(result.suggestedTags.length).toBeGreaterThan(0);
    expect(result.targetAudience.length).toBeGreaterThan(0);
    expect(result.confidenceScore).toBeGreaterThan(0);
  });

  it('extracts flat currency savings when specified in concept notes', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const input: AIOfferInput = {
      businessName: 'Royal Tailors',
      category: 'fashion',
      conceptNotes: 'Grand opening offer: Flat ₹500 off on any customized suit or blazer with minimum spend of ₹3000.',
    };

    const result = await aiOfferOnboardingService.generateOfferDraft(input);

    expect(result.offerDraft.valueType).toBe('FIXED_AMOUNT');
    expect(result.offerDraft.value).toBe(500);
    expect(result.offerDraft.title).toContain('₹500');
  });

  it('identifies missing terms or promo codes and prompts follow-up questions', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const input: AIOfferInput = {
      businessName: 'Urban Spa & Wellness',
      category: 'beauty',
      conceptNotes: 'General 20% discount on aromatherapy.',
    };

    const result = await aiOfferOnboardingService.generateOfferDraft(input);

    expect(Array.isArray(result.missingFieldsIdentified)).toBe(true);
    expect(Array.isArray(result.followUpQuestions)).toBe(true);
    expect(result.followUpQuestions.length).toBeGreaterThan(0);
  });

  it('handles successful API response from Gemini backend route', async () => {
    const mockApiResponse = {
      offerDraft: {
        title: 'Exclusive 40% Off Weekend High Tea',
        providerName: 'The Savoy Lounge',
        description: 'Enjoy a curated selection of savory delights and artisan teas with 40% discount.',
        categoryId: 'food-dining',
        categoryName: 'Food & Dining',
        valueType: 'PERCENTAGE',
        value: 40,
        scope: 'NEARBY',
      },
      promotionalHighlights: ['Handcrafted pastries', 'Premium imported teas'],
      targetAudience: ['High tea enthusiasts', 'Weekend brunchers'],
      suggestedTags: ['tea', 'brunch', 'patisserie'],
      missingFieldsIdentified: ['Table reservation link'],
      followUpQuestions: ['Do you require advance bookings?'],
      confidenceScore: 0.94,
      isAiGenerated: true,
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const input: AIOfferInput = {
      businessName: 'The Savoy Lounge',
      category: 'food-dining',
      conceptNotes: '40% off high tea on weekends',
    };

    const result = await aiOfferOnboardingService.generateOfferDraft(input);

    expect(result.offerDraft.title).toBe('Exclusive 40% Off Weekend High Tea');
    expect(result.isAiGenerated).toBe(true);
    expect(result.confidenceScore).toBe(0.94);
  });
});
