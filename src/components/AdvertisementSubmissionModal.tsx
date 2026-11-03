/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Megaphone,
  MapPin,
  Calendar,
  Percent,
  IndianRupee,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  Eye,
  CheckCircle,
  Upload,
  ImageIcon,
  Loader2,
  RefreshCw,
  Sliders,
  Check,
  ShieldCheck,
  Cpu,
  Layers,
  Wand2,
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../config/categories';
import {
  Advertisement,
  AdvertisementSubmissionPayload,
  BannerStandardizationInfo,
} from '../domain/models/Advertisement';
import { AuthUser, OfferValueType, OfferScope } from '../domain/models/Offer';
import { browserGeolocationService } from '../services/location/BrowserGeolocationService';
import {
  standardizeBannerFile,
  standardizeBannerFromUrl,
  validateBannerFile,
  formatBytes,
  DEMO_BANNER_PRESETS,
  STANDARD_BANNER_WIDTH,
  STANDARD_BANNER_HEIGHT,
  AIBannerAnalysis,
  OptimizationStrategy,
  generateBlackFridaySampleDataUrl,
} from '../services/image/BannerStandardizer';
import { OfferCardVisual } from './OfferCardVisual';

interface AdvertisementSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: AdvertisementSubmissionPayload) => Promise<void>;
  user: AuthUser;
  editingAd?: Advertisement | null;
}

export const AdvertisementSubmissionModal: React.FC<AdvertisementSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  editingAd,
}) => {
  const [title, setTitle] = useState('');
  const [providerName, setProviderName] = useState(
    user.advertizerProfile?.businessName || 'My Local Business'
  );
  const [providerContact, setProviderContact] = useState(
    `${user.countryCode} ${user.phoneNumber}`
  );
  const [categoryId, setCategoryId] = useState(INITIAL_CATEGORIES[0].id);
  const [valueType, setValueType] = useState<OfferValueType>('PERCENTAGE');
  const [value, setValue] = useState<number>(20);
  const [currency] = useState<'INR' | 'USD'>('INR');
  const [scope, setScope] = useState<OfferScope>('LOCAL');
  const [address, setAddress] = useState('Road No. 10, Banjara Hills');
  const [city, setCity] = useState('Hyderabad');
  const [latitude, setLatitude] = useState<number>(17.4156);
  const [longitude, setLongitude] = useState<number>(78.4350);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [description, setDescription] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [terms, setTerms] = useState<string[]>([
    'Valid on in-store purchases.',
    'Cannot be combined with other promotional coupons.',
  ]);
  const [newTerm, setNewTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Banner Upload & Automatic AI Standardization State
  const [bannerDataUrl, setBannerDataUrl] = useState<string | null>(null);
  const [bannerInfo, setBannerInfo] = useState<BannerStandardizationInfo | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIBannerAnalysis | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<OptimizationStrategy>('ai-background-extension');
  const [rawSource, setRawSource] = useState<
    | { type: 'file'; file: File }
    | { type: 'url'; url: string; name: string }
    | null
  >(null);
  const [isProcessingBanner, setIsProcessingBanner] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form fields
  useEffect(() => {
    if (editingAd) {
      setTitle(editingAd.title);
      setProviderName(editingAd.providerName);
      setProviderContact(editingAd.providerContact || '');
      setCategoryId(editingAd.categoryId);
      setValueType(editingAd.valueType);
      setValue(editingAd.value);
      setScope(editingAd.scope);
      setAddress(editingAd.location?.address || '');
      setCity(editingAd.location?.city || 'Hyderabad');
      setLatitude(editingAd.location?.latitude || 17.4156);
      setLongitude(editingAd.location?.longitude || 78.4350);
      setValidFrom(editingAd.validFrom.slice(0, 16));
      setValidUntil(editingAd.validUntil.slice(0, 16));
      setDescription(editingAd.description);
      setPromoCode(editingAd.promoCode || '');
      setTerms(editingAd.termsAndConditions?.length ? editingAd.termsAndConditions : ['Valid on all orders.']);
      setBannerDataUrl(editingAd.bannerImageUrl || (editingAd.imageUrls?.[0] || null));
      setBannerInfo(editingAd.bannerInfo || null);
      if (editingAd.bannerInfo?.aiAnalysis) {
        setAiAnalysis({
          hasText: editingAd.bannerInfo.aiAnalysis.hasText,
          detectedText: editingAd.bannerInfo.aiAnalysis.detectedText,
          keyElements: editingAd.bannerInfo.aiAnalysis.keyElements,
          contentBounds: { top: 10, left: 10, bottom: 90, right: 90 },
          backgroundAnalysis: {
            type: 'gradient',
            primaryColor: '#0522c7',
            secondaryColor: '#0b3bf4',
            edgeColors: { left: '#041cb3', right: '#0b3bf4', top: '#0522c7', bottom: '#041cb3' },
            gradientDirection: 'linear-horizontal',
          },
          cropRisk: editingAd.bannerInfo.aiAnalysis.cropRisk,
          cropWarning: editingAd.bannerInfo.aiAnalysis.cropWarning,
          recommendedStrategy: editingAd.bannerInfo.aiAnalysis.recommendedStrategy,
          explanation: editingAd.bannerInfo.aiAnalysis.explanation,
          isAiPowered: editingAd.bannerInfo.aiAnalysis.isAiPowered,
        });
      }
    } else {
      const now = new Date();
      const in7Days = new Date(Date.now() + 7 * 24 * 3600 * 1000);
      setValidFrom(now.toISOString().slice(0, 16));
      setValidUntil(in7Days.toISOString().slice(0, 16));
      setTitle('');
      setDescription('');
      setPromoCode('');
      setTerms([
        'Valid on in-store purchases above ₹499.',
        'Present the active offer barcode or code before billing.',
      ]);
      setBannerDataUrl(null);
      setBannerInfo(null);
      setAiAnalysis(null);
      setRawSource(null);
    }
    setError(null);
    setBannerError(null);
    setIsProcessingBanner(false);
  }, [editingAd, isOpen]);

  if (!isOpen) return null;

  const handleAddTerm = () => {
    if (!newTerm.trim()) return;
    setTerms([...terms, newTerm.trim()]);
    setNewTerm('');
  };

  const handleRemoveTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleDetectLocation = async () => {
    try {
      const loc = await browserGeolocationService.getCurrentLocation();
      setLatitude(Number(loc.coordinates.latitude.toFixed(4)));
      setLongitude(Number(loc.coordinates.longitude.toFixed(4)));
      if (loc.label) {
        setAddress(loc.label);
      }
    } catch {
      setError('Unable to detect GPS coordinates. Using reference anchor.');
    }
  };

  // Automatic AI Banner Upload & Optimization
  const processUploadedFile = async (file: File, strategy?: OptimizationStrategy) => {
    setBannerError(null);

    const validation = validateBannerFile(file);
    if (!validation.valid) {
      setBannerError(validation.error || 'Invalid image file.');
      return;
    }

    setIsProcessingBanner(true);
    setRawSource({ type: 'file', file });

    try {
      const result = await standardizeBannerFile(file, strategy);
      setBannerDataUrl(result.bannerDataUrl);
      setBannerInfo(result.bannerInfo);
      setAiAnalysis(result.aiAnalysis);
      if (result.bannerInfo.optimizationStrategy) {
        setSelectedStrategy(result.bannerInfo.optimizationStrategy);
      }
    } catch (err: unknown) {
      setBannerError(err instanceof Error ? err.message : 'Failed to standardize banner image.');
    } finally {
      setIsProcessingBanner(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleSelectPreset = async (presetUrl: string, presetName: string, strategy?: OptimizationStrategy) => {
    setBannerError(null);
    setIsProcessingBanner(true);

    let actualUrl = presetUrl;
    if (presetUrl === 'SAMPLE_BLACK_FRIDAY_DATA_URL') {
      actualUrl = generateBlackFridaySampleDataUrl();
    }

    setRawSource({ type: 'url', url: actualUrl, name: presetName });

    try {
      const result = await standardizeBannerFromUrl(actualUrl, `${presetName.toLowerCase().replace(/\s+/g, '_')}.jpg`, strategy);
      setBannerDataUrl(result.bannerDataUrl);
      setBannerInfo(result.bannerInfo);
      setAiAnalysis(result.aiAnalysis);
      if (result.bannerInfo.optimizationStrategy) {
        setSelectedStrategy(result.bannerInfo.optimizationStrategy);
      }
    } catch (err: unknown) {
      setBannerError(err instanceof Error ? err.message : 'Failed to standardize preset banner.');
    } finally {
      setIsProcessingBanner(false);
    }
  };

  // Re-applies another strategy instantly on the loaded source image
  const handleStrategyChange = async (newStrategy: OptimizationStrategy) => {
    if (!rawSource) return;
    setSelectedStrategy(newStrategy);
    if (rawSource.type === 'file') {
      await processUploadedFile(rawSource.file, newStrategy);
    } else {
      await handleSelectPreset(rawSource.url, rawSource.name, newStrategy);
    }
  };

  const handleRemoveBanner = () => {
    setBannerDataUrl(null);
    setBannerInfo(null);
    setAiAnalysis(null);
    setRawSource(null);
    setBannerError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isProcessingBanner) {
      setError('Please wait for AI banner optimization to complete before submitting.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a compelling advertisement title.');
      return;
    }
    if (!providerName.trim()) {
      setError('Please enter your business or shop name.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description of the offer.');
      return;
    }
    if (value <= 0) {
      setError('Discount value must be greater than zero.');
      return;
    }
    if (valueType === 'PERCENTAGE' && value > 100) {
      setError('Percentage discount cannot exceed 100%.');
      return;
    }
    if (new Date(validUntil).getTime() <= new Date(validFrom).getTime()) {
      setError('Valid Until date must be later than Valid From date.');
      return;
    }

    const selectedCategory = INITIAL_CATEGORIES.find((c) => c.id === categoryId) || INITIAL_CATEGORIES[0];

    const payload: AdvertisementSubmissionPayload = {
      title: title.trim(),
      providerName: providerName.trim(),
      providerContact: providerContact.trim() || undefined,
      description: description.trim(),
      categoryId,
      categoryName: selectedCategory.name,
      valueType,
      value: Number(value),
      currency,
      scope,
      location:
        scope === 'LOCAL'
          ? {
              label: address ? address.split(',')[0] : providerName,
              address: address.trim(),
              latitude,
              longitude,
              city: city.trim() || 'Hyderabad',
            }
          : undefined,
      validFrom: new Date(validFrom).toISOString(),
      validUntil: new Date(validUntil).toISOString(),
      termsAndConditions: terms.filter((t) => t.trim().length > 0),
      imageUrls: bannerDataUrl ? [bannerDataUrl] : [],
      bannerImageUrl: bannerDataUrl || undefined,
      bannerInfo: bannerInfo || undefined,
      promoCode: promoCode.trim().toUpperCase() || undefined,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit advertisement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="safe-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Megaphone size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingAd ? 'Edit & Resubmit Advertisement' : 'Submit Advertisement for Approval'}
              </h2>
              <p className="text-xs text-slate-500">
                Submitted campaigns undergo Admin review before live publishing.
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

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {editingAd?.rejectionReason && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1 text-rose-900">
              <div className="font-bold flex items-center gap-1.5 text-rose-800">
                <AlertCircle size={15} />
                <span>Previous Admin Rejection Reason:</span>
              </div>
              <p className="text-rose-700 leading-relaxed pl-5">
                {editingAd.rejectionReason}
              </p>
            </div>
          )}

          {/* Section 1: Business Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Business / Provider Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Shop Name *
                </label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="e.g. Wild Yeast Artisan Boulangerie"
                  required
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone / Email
                </label>
                <input
                  type="text"
                  value={providerContact}
                  onChange={(e) => setProviderContact(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Offer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Advertisement Offer Details
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Headline / Offer Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 40% Off Artisanal Sourdough & Gourmet Flatbreads"
                required
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  {INITIAL_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discount Type *
                </label>
                <select
                  value={valueType}
                  onChange={(e) => setValueType(e.target.value as OfferValueType)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="PERCENTAGE">Percentage (% Off)</option>
                  <option value="FIXED_AMOUNT">Flat Amount (₹ Off)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discount Value *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={valueType === 'PERCENTAGE' ? 100 : 50000}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    required
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-9 tabular-nums"
                  />
                  <div className="absolute right-3 top-2.5 text-slate-400">
                    {valueType === 'PERCENTAGE' ? <Percent size={14} /> : <IndianRupee size={14} />}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description & Benefits *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what items or experiences are included, dining ambiance, special ingredients, etc."
                required
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Promo Code (Optional)
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="e.g. YEAST40"
                  className="w-full text-xs font-mono font-bold uppercase bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-indigo-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tracking-wider"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Audience Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as OfferScope)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="LOCAL">Local Nearby (Store / Physical Outlet)</option>
                  <option value="ONLINE">Online Store (E-Commerce)</option>
                  <option value="NATIONAL">National Brand-Wide</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: AI-Powered Banner Analysis & Background Extension */}
          <div className="space-y-4 p-4 bg-slate-50/90 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={15} className="text-indigo-600" />
                  <span>3. AI-Powered Banner Optimization & Content Protection</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  AI vision analyzes text, logos, and focal elements. If the aspect ratio differs from standard <strong>1200 × 675 px (16:9)</strong>, the background is intelligently extended without cutting off, hiding, or distorting any content.
                </p>
              </div>
            </div>

            {/* Error Message for Banner Upload */}
            {bannerError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <span className="font-semibold block">Banner Upload Error</span>
                  <span className="text-[11px]">{bannerError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBannerError(null)}
                  className="text-rose-400 hover:text-rose-700 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/bmp"
              className="hidden"
            />

            {/* Banner Processing Spinner with AI Telemetry */}
            {isProcessingBanner ? (
              <div className="p-8 border-2 border-dashed border-indigo-300 bg-indigo-50/60 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative">
                  <Loader2 size={36} className="animate-spin text-indigo-600" />
                  <Sparkles size={16} className="absolute -top-1 -right-1 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-indigo-950 flex items-center justify-center gap-1.5">
                    <Cpu size={14} className="text-indigo-600" />
                    <span>AI Vision: Analyzing Elements & Synthesizing Background...</span>
                  </p>
                  <p className="text-[11px] text-indigo-700 mt-1 max-w-md mx-auto">
                    Detecting text headlines, logos, and edge colors. Intelligently scaling and extending background so zero content is cut off or cropped.
                  </p>
                </div>
              </div>
            ) : bannerDataUrl ? (
              /* Processed Standardized Banner Display & AI Report */
              <div className="space-y-3.5">
                {/* AI Content Protection & Crop Hazard Status Banner */}
                {aiAnalysis && (
                  <div
                    className={`p-3 rounded-2xl border text-xs space-y-2 ${
                      aiAnalysis.cropRisk === 'HIGH' || aiAnalysis.cropRisk === 'MEDIUM'
                        ? 'bg-amber-50/90 border-amber-200/90 text-amber-950'
                        : 'bg-emerald-50/90 border-emerald-200/90 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Sparkles size={14} className={aiAnalysis.cropRisk === 'SAFE' ? 'text-emerald-600' : 'text-amber-600'} />
                        <span>AI Vision Content Analysis:</span>
                        <span className="font-extrabold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-white/80 border border-current">
                          {aiAnalysis.cropRisk === 'SAFE' ? '16:9 Standard Aligned' : 'AI Protection Active'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck size={12} />
                        <span>100% Content Preserved</span>
                      </span>
                    </div>

                    {/* Detected Content & Warning Notice */}
                    <div className="text-[11px] space-y-1">
                      {aiAnalysis.detectedText && (
                        <p className="leading-relaxed">
                          <strong>Detected Content:</strong> &ldquo;{aiAnalysis.detectedText}&rdquo;
                          {aiAnalysis.keyElements?.length > 0 && ` (${aiAnalysis.keyElements.join(', ')})`}
                        </p>
                      )}
                      {aiAnalysis.cropWarning ? (
                        <p className="text-amber-800 font-medium leading-relaxed bg-white/70 p-2 rounded-xl border border-amber-200/60">
                          <strong>Intelligent Adjustment:</strong> {aiAnalysis.cropWarning}
                        </p>
                      ) : (
                        <p className="text-slate-600">
                          {aiAnalysis.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Strategy Selector Tabs */}
                {rawSource && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Wand2 size={12} className="text-indigo-600" />
                      <span>Select AI Layout & Padding Strategy:</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleStrategyChange('ai-background-extension')}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedStrategy === 'ai-background-extension'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <span className="block text-[11px] font-bold flex items-center gap-1">
                          <Sparkles size={11} className={selectedStrategy === 'ai-background-extension' ? 'text-amber-300' : 'text-indigo-600'} />
                          <span>AI Extension</span>
                        </span>
                        <span className={`block text-[10px] ${selectedStrategy === 'ai-background-extension' ? 'text-indigo-100' : 'text-slate-500'}`}>
                          Seamless outpaint (100% visible)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStrategyChange('ai-ambient-glow')}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedStrategy === 'ai-ambient-glow'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <span className="block text-[11px] font-bold flex items-center gap-1">
                          <Layers size={11} className={selectedStrategy === 'ai-ambient-glow' ? 'text-amber-300' : 'text-indigo-600'} />
                          <span>Ambient Glow</span>
                        </span>
                        <span className={`block text-[10px] ${selectedStrategy === 'ai-ambient-glow' ? 'text-indigo-100' : 'text-slate-500'}`}>
                          Modern blurred backdrop
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStrategyChange('ai-clean-fit')}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedStrategy === 'ai-clean-fit'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <span className="block text-[11px] font-bold">Clean Fit</span>
                        <span className={`block text-[10px] ${selectedStrategy === 'ai-clean-fit' ? 'text-indigo-100' : 'text-slate-500'}`}>
                          Neutral theater frame
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStrategyChange('cover-center')}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedStrategy === 'cover-center'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        } ${aiAnalysis?.cropRisk === 'HIGH' ? 'opacity-80' : ''}`}
                      >
                        <span className="block text-[11px] font-bold flex items-center gap-1">
                          <span>Center Crop</span>
                          {aiAnalysis?.cropRisk === 'HIGH' && (
                            <span className="text-[9px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-bold">
                              Crops Text
                            </span>
                          )}
                        </span>
                        <span className={`block text-[10px] ${selectedStrategy === 'cover-center' ? 'text-slate-300' : 'text-slate-500'}`}>
                          Direct 16:9 crop
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Visual Banner Preview in 16:9 Aspect Ratio */}
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-300 shadow-md bg-slate-900 group">
                  <img
                    src={bannerDataUrl}
                    alt="Standardized banner preview"
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Overlay Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                    <div className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                      <Check size={12} strokeWidth={3} />
                      <span>Standardized 1200 × 675 px · WebP</span>
                    </div>
                    {bannerInfo?.contentPreservationPercent === 100 && (
                      <div className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                        <Sparkles size={11} />
                        <span>100% Content Intact</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl shadow-md hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Replace Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      className="px-3.5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-rose-500 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* Banner Metrics & Standardization Assurance Card */}
                {bannerInfo && (
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Sliders size={13} className="text-indigo-600" />
                        <span>Pre-Approval Standardization & AI Protection Report</span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <Check size={11} strokeWidth={3} />
                        <span>Ready for Admin Review</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Original Upload
                        </span>
                        <span className="font-bold text-slate-800">
                          {bannerInfo.originalDimensions.width} × {bannerInfo.originalDimensions.height} px
                        </span>
                        <span className="text-slate-500 block text-[10px]">
                          {formatBytes(bannerInfo.originalSizeBytes)}
                        </span>
                      </div>

                      <div className="bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                        <span className="text-indigo-600 block text-[10px] uppercase font-semibold">
                          Standard Output
                        </span>
                        <span className="font-bold text-indigo-950">
                          1200 × 675 px
                        </span>
                        <span className="text-indigo-700 block text-[10px]">
                          16:9 Universal Standard
                        </span>
                      </div>

                      <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                        <span className="text-emerald-700 block text-[10px] uppercase font-semibold">
                          Content Preservation
                        </span>
                        <span className="font-bold text-emerald-950">
                          {bannerInfo.contentPreservationPercent}% Visible
                        </span>
                        <span className="text-emerald-700 block text-[10px]">
                          Zero Text/Logo Loss
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Format & Size
                        </span>
                        <span className="font-bold text-slate-800 uppercase">
                          {bannerInfo.standardFormat.replace('image/', '')}
                        </span>
                        <span className="text-slate-500 block text-[10px]">
                          {formatBytes(bannerInfo.standardSizeBytes)}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
                      <CheckCircle size={12} className="text-emerald-600 shrink-0" />
                      <span>
                        The Admin Dashboard receives this exact standardized banner asset with 100% intact typography and visuals.
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Dropzone for Uploading */
              <div className="space-y-3">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                    isDraggingOver
                      ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
                      : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <div className="w-10 h-10 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse or drag & drop banner image
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                    Supports PNG, JPG, WebP, GIF (Max 10MB). AI analyzes text and expands background to 1200 × 675 px without cutting off content.
                  </p>
                </div>

                {/* 1-Click Sample Preset Banners for Rapid Demo Testing */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" />
                    <span>Test AI banner optimization with curated merchant presets:</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEMO_BANNER_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.previewUrl, preset.name)}
                        className={`p-2.5 bg-white hover:bg-indigo-50 border rounded-xl text-left transition-all cursor-pointer group flex items-start gap-2.5 ${
                          preset.id === 'preset-black-friday'
                            ? 'border-indigo-300 bg-indigo-50/30 ring-1 ring-indigo-400/20'
                            : 'border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="w-12 h-9 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                          {preset.id === 'preset-black-friday' ? (
                            <div className="w-full h-full bg-blue-700 flex items-center justify-center text-[8px] font-black text-yellow-300 text-center leading-none p-0.5">
                              BLACK FRIDAY
                            </div>
                          ) : (
                            <img
                              src={preset.previewUrl}
                              alt={preset.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="truncate flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold text-slate-900 group-hover:text-indigo-900 truncate">
                              {preset.name}
                            </span>
                            {preset.id === 'preset-black-friday' && (
                              <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                                Test Case
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                            {preset.aspectDescription}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Physical Location (If Local) */}
          {scope === 'LOCAL' && (
            <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin size={14} className="text-indigo-600" />
                  Store Location Details
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>Use GPS Location</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Store Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Plot 418, Road No. 14, Banjara Hills"
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 tabular-nums"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Validity Schedule */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-indigo-600" />
              <span>5. Validity Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valid From *
                </label>
                <input
                  type="datetime-local"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  required
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valid Until (Expiration) *
                </label>
                <input
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  required
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Terms & Conditions */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              6. Terms & Conditions
            </h3>

            <div className="space-y-1.5">
              {terms.map((term, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs">•</span>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => {
                      const updated = [...terms];
                      updated[idx] = e.target.value;
                      setTerms(updated);
                    }}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTerm(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                placeholder="Add another term (e.g. Valid on dine-in only)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTerm();
                  }
                }}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddTerm}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Live Offer Card Preview Accordion */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full flex items-center justify-between text-xs font-bold text-indigo-700 hover:text-indigo-900 py-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Eye size={14} />
                <span>{showPreview ? 'Hide Offer Card Preview' : 'Show User Card Preview'}</span>
              </span>
              <span>{showPreview ? '▲' : '▼'}</span>
            </button>

            {showPreview && (
              <div className="mt-3 p-4 bg-slate-100 rounded-2xl border border-slate-200 flex justify-center">
                <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
                  <OfferCardVisual
                    categoryId={categoryId}
                    categoryName={INITIAL_CATEGORIES.find((c) => c.id === categoryId)?.name || 'Offer'}
                    valueType={valueType}
                    value={value}
                    currency={currency}
                    imageUrl={bannerDataUrl || undefined}
                    className="h-40"
                  />
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {valueType === 'PERCENTAGE' ? `${value}% OFF` : `₹${value} OFF`}
                      </span>
                      {promoCode && (
                        <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {promoCode}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                      {title || 'Your Offer Title Will Appear Here'}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {providerName} {scope === 'LOCAL' && `· ${city}`}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {description || 'Offer description will be displayed here for nearby buyers.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Workflow & Policy Disclosure */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 leading-relaxed flex items-start gap-2">
            <CheckCircle size={15} className="shrink-0 text-indigo-600 mt-0.5" />
            <span>
              <strong>AI Content Protection Guarantee:</strong> The system automatically preserves 100% of your banner typography and products without cropping or cutoffs. An administrator reviews the exact standardized asset before live publishing.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isProcessingBanner}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isProcessingBanner}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : isProcessingBanner ? (
                <span>AI Optimizing Banner...</span>
              ) : (
                <>
                  <Megaphone size={14} />
                  <span>{editingAd ? 'Resubmit for Approval' : 'Submit for Admin Approval'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
