/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Tag,
  Percent,
  Calendar,
  Layers,
  HelpCircle,
  Megaphone,
  Check,
  Loader2,
  Sliders,
  ShieldCheck,
  Video,
  Upload,
} from 'lucide-react';
import { AuthUser } from '../domain/models/Offer';
import { VendorProfile, CreateVendorPayload } from '../domain/models/Vendor';
import { INITIAL_CATEGORIES } from '../config/categories';
import { vendorService } from '../services/vendors/VendorService';
import { aiOfferOnboardingService, AIOfferAnalysisResult } from '../services/ai/AIOfferOnboardingService';
import { advertisementService } from '../services/advertisements/AdvertisementService';
import { AdvertisementSubmissionPayload } from '../domain/models/Advertisement';

interface VendorOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onCompleted: (vendor: VendorProfile) => void;
}

type Step = 1 | 2 | 3 | 4;

export const VendorOnboardingWizard: React.FC<VendorOnboardingWizardProps> = ({
  isOpen,
  onClose,
  user,
  onCompleted,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1: Business Profile
  const [businessName, setBusinessName] = useState(user.advertizerProfile?.businessName || 'My Local Business');
  const [category, setCategory] = useState(INITIAL_CATEGORIES[0].id);
  const [contactPhone, setContactPhone] = useState(`${user.countryCode} ${user.phoneNumber}`);
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('Road No. 36, Jubilee Hills');
  const [city, setCity] = useState('Hyderabad');

  // Step 2: AI Offer Generation Input
  const [conceptNotes, setConceptNotes] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResult, setAiResult] = useState<AIOfferAnalysisResult | null>(null);

  // Step 3: Offer Editing
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [valueType, setValueType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [promoCode, setPromoCode] = useState('');
  const [terms, setTerms] = useState<string[]>([
    'Valid on in-store purchases.',
    'Cannot be combined with other promotional coupons.',
  ]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState<string[]>([]);

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Step 1 -> Step 2
  const handleProceedToOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Please enter your business name.');
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  // Step 2: Run AI Copilot
  const handleRunAiCopilot = async () => {
    if (!conceptNotes.trim()) {
      setError('Please enter a few words about what promotion you want to offer.');
      return;
    }
    setError(null);
    setIsGeneratingAi(true);

    try {
      const result = await aiOfferOnboardingService.generateOfferDraft({
        businessName,
        category,
        conceptNotes,
        locationCity: city,
        scope: 'LOCAL',
      });

      setAiResult(result);
      setOfferTitle(result.offerDraft.title);
      setOfferDescription(result.offerDraft.description);
      setDiscountValue(result.offerDraft.value);
      setValueType(result.offerDraft.valueType);
      setPromoCode(result.offerDraft.promoCode || 'PROMO20');
      setTerms(result.offerDraft.termsAndConditions || ['Valid on all orders.']);
      setHighlights(result.promotionalHighlights || []);
      setTargetAudience(result.targetAudience || []);

      setCurrentStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'AI generation error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Step 3 -> Step 4
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim()) {
      setError('Offer title is required.');
      return;
    }
    setError(null);
    setCurrentStep(4);
  };

  // Final Submission: Atomic Vendor Profile + Offer Creation
  const handleFinalSubmit = async (asDraft: boolean = false) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create or update Vendor Profile
      const vendorPayload: CreateVendorPayload = {
        userId: user.uid,
        businessName: businessName.trim(),
        category,
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim() || `${businessName.toLowerCase().replace(/\s+/g, '')}@business.local`,
        address: address.trim(),
        city: city.trim(),
        country: 'India',
        latitude: 17.4319,
        longitude: 78.4075,
      };

      const vendor = await vendorService.registerVendor(vendorPayload, user);

      // 2. Submit initial offer
      const now = new Date();
      const validUntil = new Date(Date.now() + 14 * 24 * 3600 * 1000);

      const offerPayload: AdvertisementSubmissionPayload = {
        vendorId: vendor.id,
        title: offerTitle.trim(),
        providerName: businessName.trim(),
        providerContact: contactPhone.trim(),
        description: offerDescription.trim(),
        categoryId: category,
        categoryName: INITIAL_CATEGORIES.find((c) => c.id === category)?.name || 'Retail',
        valueType,
        value: Number(discountValue),
        currency: 'INR',
        scope: 'LOCAL',
        location: {
          label: businessName,
          address,
          city,
          latitude: 17.4319,
          longitude: 78.4075,
        },
        validFrom: now.toISOString().slice(0, 16),
        validUntil: validUntil.toISOString().slice(0, 16),
        termsAndConditions: terms,
        promotionalHighlights: highlights,
        promoCode: promoCode.trim().toUpperCase(),
        isDraft: asDraft,
      };

      await advertisementService.submitAdvertisement(offerPayload, user);

      // 3. Update onboarding step to Completed
      await vendorService.updateOnboardingProgress(vendor.id, 'COMPLETED', 100);

      onCompleted(vendor);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to finalize vendor onboarding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    switch (currentStep) {
      case 1:
        return 25;
      case 2:
        return 50;
      case 3:
        return 75;
      case 4:
        return 100;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Building2 size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Vendor Onboarding &amp; AI Offer Setup
                </h2>
                <p className="text-xs text-slate-500">
                  Step {currentStep} of 4: {currentStep === 1 ? 'Business Profile' : currentStep === 2 ? 'AI Offer Copilot' : currentStep === 3 ? 'Review & Customize' : 'Launch Confirmation'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: Business Profile */}
          {currentStep === 1 && (
            <form onSubmit={handleProceedToOffer} className="space-y-4">
              <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-900">
                <Sparkles size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Welcome to Offema! Set up your registered vendor profile to publish offers, manage advertisements, and track real buyer analytics.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Store Name *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Wild Yeast Bakery or Central Fitness Studio"
                  required
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 cursor-pointer"
                  >
                    {INITIAL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Contact Phone *
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Address / Landmark
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Neighborhood
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <span>Continue to AI Offer Creation</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: AI Offer Copilot Input */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Wand2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-indigo-950">
                      AI Agent Offer Copilot
                    </h3>
                    <p className="text-[11px] text-indigo-700">
                      Describe your promotion in plain language. The AI agent will extract discount values, draft titles, highlight benefits, and identify missing fields.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe what offer or discount you want to run: *
                </label>
                <textarea
                  rows={4}
                  value={conceptNotes}
                  onChange={(e) => setConceptNotes(e.target.value)}
                  placeholder="e.g. We want to offer 30% off on all artisan sourdough loaves and breakfast pastries for morning visitors this week."
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Sample Quick Prompt Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Or pick a sample prompt:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Flat ₹500 off on designer frames & prescription lenses above ₹2500',
                    '40% off sourdough breads & savory treats for in-store customers',
                    '25% off complete automotive detailing and foam wash on weekdays',
                    'Buy 1 Get 1 free on gourmet signature coffee & mocktails',
                  ].map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setConceptNotes(sample)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-xl text-[11px] transition-all cursor-pointer text-left"
                    >
                      &ldquo;{sample}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleRunAiCopilot}
                  disabled={isGeneratingAi || !conceptNotes.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>AI Agent Generating Offer Draft...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Generate Offer Draft</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Customize AI Draft */}
          {currentStep === 3 && (
            <form onSubmit={handleProceedToReview} className="space-y-4">
              {aiResult && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>AI Offer Draft Synthesized Successfully</span>
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {Math.round(aiResult.confidenceScore * 100)}% Confidence
                    </span>
                  </div>

                  {aiResult.missingFieldsIdentified.length > 0 && (
                    <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-200/60 text-[11px] text-slate-700 space-y-1">
                      <strong className="text-indigo-900 block font-semibold flex items-center gap-1">
                        <HelpCircle size={12} className="text-indigo-600" />
                        <span>AI Follow-Up Clarifications:</span>
                      </strong>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                        {aiResult.followUpQuestions.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Drafted Offer Title *
                </label>
                <input
                  type="text"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  required
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={valueType}
                    onChange={(e) => setValueType(e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT')}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 cursor-pointer"
                  >
                    <option value="PERCENTAGE">Percentage (% Off)</option>
                    <option value="FIXED_AMOUNT">Flat Amount (₹ Off)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    required
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Offer Description &amp; Benefits *
                </label>
                <textarea
                  rows={2}
                  value={offerDescription}
                  onChange={(e) => setOfferDescription(e.target.value)}
                  required
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Promo Code
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono font-bold uppercase bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-indigo-700"
                />
              </div>

              {/* Promotional Highlights */}
              {highlights.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    AI Suggested Highlights:
                  </span>
                  <div className="space-y-1 text-xs">
                    {highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg text-slate-700 text-[11px]">
                        <Check size={12} className="text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Modify Prompt</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <span>Review &amp; Finalize</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Launch Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={22} className="text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Ready to Publish or Save
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Your vendor profile and offer draft have been generated and validated. You can submit immediately for Admin Approval or save it as a draft to edit later.
                  </p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-900">{businessName}</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {category}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-slate-900">{offerTitle}</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{offerDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Discount</span>
                    <span className="font-bold text-indigo-700">
                      {valueType === 'PERCENTAGE' ? `${discountValue}% OFF` : `₹${discountValue} OFF`}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Promo Code</span>
                    <span className="font-mono font-bold text-slate-800">{promoCode}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Edit</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFinalSubmit(true)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinalSubmit(false)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Megaphone size={14} />
                        <span>Submit for Admin Approval</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
