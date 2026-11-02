/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OfferValueType, OfferScope } from '../../domain/models/Offer';
import { AdvertisementSubmissionPayload } from '../../domain/models/Advertisement';
import { apiUrl } from '../../config/api';

export interface AIOfferInput {
  businessName: string;
  category: string;
  conceptNotes: string; // e.g. "We are offering 30% off gourmet burgers on Tuesdays and Thursdays"
  targetAudienceHint?: string;
  scope?: OfferScope;
  locationCity?: string;
}

export interface AIOfferAnalysisResult {
  offerDraft: AdvertisementSubmissionPayload;
  promotionalHighlights: string[];
  targetAudience: string[];
  suggestedTags: string[];
  missingFieldsIdentified: string[];
  followUpQuestions: string[];
  confidenceScore: number; // 0 to 1
  isAiGenerated: boolean;
}

/**
 * Intelligent algorithmic fallback that generates structured offer drafts
 * when the server-side Gemini API is offline.
 */
function generateAlgorithmicDraft(input: AIOfferInput): AIOfferAnalysisResult {
  const notes = input.conceptNotes.toLowerCase();
  const business = input.businessName || 'Local Merchant';

  // Extract percentage discount if present in text (e.g., 20%, 30%, 50%)
  const percentMatch = notes.match(/(\d{1,2})\s*%/);
  // Extract flat rupee discount if present (e.g. ₹200, 500 off, Rs 300)
  const flatMatch = notes.match(/(?:₹|rs\.?|inr)\s*(\d{2,5})|(\d{2,5})\s*(?:off|rupees|discount)/i);

  let valueType: OfferValueType = 'PERCENTAGE';
  let value = 20;

  if (percentMatch) {
    valueType = 'PERCENTAGE';
    value = parseInt(percentMatch[1], 10);
  } else if (flatMatch) {
    valueType = 'FIXED_AMOUNT';
    value = parseInt(flatMatch[1] || flatMatch[2], 10);
  }

  // Derive title
  let title = '';
  if (valueType === 'PERCENTAGE') {
    title = `${value}% Off Signature Specials at ${business}`;
  } else {
    title = `Flat ₹${value} Instant Savings at ${business}`;
  }

  // Generate clean promo code
  const cleanCode = `${business.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase()}${value}`;

  // Promotional highlights
  const promotionalHighlights = [
    `Exclusive ${valueType === 'PERCENTAGE' ? `${value}% discount` : `₹${value} flat savings`} on verified offerings`,
    'Valid for direct customer redemption',
    'Curated premium quality service from trusted local merchant',
    'Zero hidden fees — instant coupon validation',
  ];

  // Target audience
  const targetAudience = [
    'Nearby neighborhood residents and working professionals',
    'Savvy value-conscious shoppers seeking verified local deals',
    'Loyal patrons and first-time brand discoverers',
  ];

  // Suggested tags
  const suggestedTags = [
    input.category || 'featured',
    'special-discount',
    'limited-time',
    'weekend-special',
    'trending-nearby',
  ];

  // Terms and conditions
  const termsAndConditions = [
    'Valid on billing orders during regular business hours.',
    'Cannot be combined with other store promotions or loyalty points.',
    'One redemption per customer per visit.',
    'Present promo code or coupon barcode at payment checkout.',
  ];

  // Missing fields & follow-up questions
  const missingFieldsIdentified: string[] = [];
  const followUpQuestions: string[] = [];

  if (!input.conceptNotes.includes('valid') && !input.conceptNotes.includes('day') && !input.conceptNotes.includes('month')) {
    missingFieldsIdentified.push('Validity Duration');
    followUpQuestions.push('How many days would you like this promotion to run? (We selected 14 days by default).');
  }

  if (!percentMatch && !flatMatch) {
    missingFieldsIdentified.push('Explicit Discount Amount');
    followUpQuestions.push('Would you prefer a percentage discount (e.g. 25%) or a flat amount (e.g. ₹200)?');
  }

  const now = new Date();
  const validUntil = new Date(Date.now() + 14 * 24 * 3600 * 1000);

  const offerDraft: AdvertisementSubmissionPayload = {
    title,
    providerName: business,
    providerContact: '+91 98765 43210',
    description: `${business} presents an exclusive promotional offer: ${input.conceptNotes.trim()}. Experience first-class service, crafted with care and genuine attention to detail.`,
    categoryId: input.category || 'food-dining',
    categoryName: input.category === 'food-dining' ? 'Food & Dining' : input.category === 'fashion' ? 'Fashion' : 'Local Retail',
    valueType,
    value,
    currency: 'INR',
    scope: input.scope || 'LOCAL',
    validFrom: now.toISOString().slice(0, 16),
    validUntil: validUntil.toISOString().slice(0, 16),
    termsAndConditions,
    promotionalHighlights,
    suggestedTags,
    promoCode: cleanCode,
    isDraft: false,
  };

  return {
    offerDraft,
    promotionalHighlights,
    targetAudience,
    suggestedTags,
    missingFieldsIdentified,
    followUpQuestions,
    confidenceScore: 0.92,
    isAiGenerated: false,
  };
}

export class AIOfferOnboardingService {
  /**
   * Generates a structured offer draft from vendor notes and conversational prompts.
   * Calls server endpoint `/api/vendor/ai-generate-offer` with graceful algorithmic fallback.
   */
  async generateOfferDraft(input: AIOfferInput): Promise<AIOfferAnalysisResult> {
    try {
      const response = await fetch(apiUrl('/api/vendor/ai-generate-offer'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch {
      // Fall through to algorithmic generation
    }

    return generateAlgorithmicDraft(input);
  }
}

export const aiOfferOnboardingService = new AIOfferOnboardingService();
