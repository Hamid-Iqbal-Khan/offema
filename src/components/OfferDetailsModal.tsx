/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Globe,
  Clock,
  Check,
  Copy,
  Star,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  Share2,
  Heart,
} from 'lucide-react';
import { OfferWithDistance } from '../domain/models/Offer';
import { OfferCardVisual } from './OfferCardVisual';
import { CountdownTimer } from './CountdownTimer';
import { formatValidityPeriod, isExpiringSoon } from '../domain/logic/offerValidity';

interface OfferDetailsModalProps {
  offer: OfferWithDistance | null;
  onClose: () => void;
  userCoordinates?: { latitude: number; longitude: number } | null;
  isFavorite?: boolean;
  onToggleFavorite?: (offerId: string) => void;
}

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({
  offer,
  onClose,
  userCoordinates,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);

  if (!offer) return null;

  const isLocal = offer.scope === 'LOCAL';
  const expiringSoon = isExpiringSoon(offer);
  const validityText = formatValidityPeriod(offer);

  const formattedValue =
    offer.valueType === 'PERCENTAGE'
      ? `${offer.value}% OFF`
      : `${offer.currency === 'INR' ? '₹' : offer.currency || '₹'}${offer.value.toLocaleString()} OFF`;

  const copyPromoCode = () => {
    if (offer.promoCode) {
      navigator.clipboard?.writeText(offer.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: offer.title,
        text: `Check out this offer from ${offer.providerName}: ${offer.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      copyPromoCode();
    }
  };

  const getDirectionsUrl = () => {
    if (!offer.location) return '#';
    const { latitude, longitude } = offer.location;
    if (userCoordinates) {
      return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userCoordinates.latitude}%2C${userCoordinates.longitude}%3B${latitude}%2C${longitude}`;
    }
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className="relative bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in slide-in-from-bottom duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar with Back and Share */}
          <div className="sticky top-0 z-20 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Offers</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => offer && onToggleFavorite?.(offer.id)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isFavorite
                    ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                    : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                }`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                title={isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
              >
                <Heart size={17} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
              </button>

              <button
                onClick={handleShare}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Share Offer"
              >
                <Share2 size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable details content */}
          <div className="overflow-y-auto flex-1 pb-6">
            {/* Visual Hero with Standardized Banner or Category Theme */}
            <OfferCardVisual
              categoryId={offer.categoryId}
              categoryName={offer.categoryName}
              valueType={offer.valueType}
              value={offer.value}
              currency={offer.currency}
              imageUrl={offer.bannerImageUrl || (offer.imageUrls && offer.imageUrls.length > 0 ? offer.imageUrls[0] : undefined)}
              className="h-48 sm:h-56"
            />

            <div className="px-5 sm:px-8 pt-5 space-y-6">
              {/* Header Title & Value */}
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="font-bold text-slate-900">{offer.providerName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{offer.categoryName}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {offer.title}
                </h1>

                {/* Value Banner */}
                <div className="mt-3 inline-flex items-baseline gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
                  <span className="text-lg sm:text-xl font-extrabold text-indigo-700 tabular-nums">
                    {formattedValue}
                  </span>
                  <span className="text-xs text-indigo-600 font-medium">
                    {offer.valueType === 'PERCENTAGE' ? 'Discount on applicable items' : 'Direct bill savings'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Offer Overview
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {offer.description}
                </p>
              </div>

              {/* Location & Directions (Local Offers) */}
              {isLocal && offer.location && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <MapPin size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {offer.location.label}
                        </h4>
                        {offer.location.address && (
                          <p className="text-xs text-slate-600 mt-0.5">
                            {offer.location.address}
                          </p>
                        )}
                        {offer.formattedDistance && (
                          <p className="text-xs font-semibold text-indigo-700 mt-1">
                            {offer.formattedDistance} from your active location
                          </p>
                        )}
                      </div>
                    </div>

                    <a
                      href={getDirectionsUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors shadow-2xs shrink-0"
                    >
                      <span>Directions</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}

              {/* Global Scope Banner */}
              {!isLocal && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-900">
                  <Globe size={20} className="text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold">
                      {offer.scope === 'ONLINE'
                        ? 'Digital / Online Offer'
                        : offer.scope === 'NATIONAL'
                        ? 'Nationwide Delivery Eligible'
                        : 'Brand-Wide Promotion'}
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      This offer is not restricted to your immediate geographic radius.
                    </p>
                  </div>
                </div>
              )}

              {/* Real-time Urgency Countdown Timer */}
              <CountdownTimer validUntil={offer.validUntil} variant="segmented" />

              {/* Validity & Expiry */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <Clock size={16} className={expiringSoon ? 'text-amber-600' : 'text-slate-500'} />
                <span className="text-slate-700">
                  Valid from{' '}
                  <strong>
                    {new Date(offer.validFrom).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>{' '}
                  until{' '}
                  <strong className={expiringSoon ? 'text-amber-700' : 'text-slate-900'}>
                    {new Date(offer.validUntil).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>{' '}
                  ({validityText})
                </span>
              </div>

              {/* Promo Code & Redemption */}
              {offer.promoCode && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Voucher / Coupon Code
                      </span>
                      <div className="text-xl font-mono font-bold tracking-wider text-amber-300">
                        {offer.promoCode}
                      </div>
                    </div>

                    <button
                      onClick={copyPromoCode}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      Show this code to merchant staff or enter during online checkout.
                    </p>
                    <button
                      onClick={() => setIsRedeemed(true)}
                      disabled={isRedeemed}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        isRedeemed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {isRedeemed ? 'Redeemed ✓' : 'Mark as Redeemed'}
                    </button>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              {offer.termsAndConditions && offer.termsAndConditions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Terms & Conditions
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {offer.termsAndConditions.map((term, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sample Reviews (Clearly labelled per specification) */}
              {offer.reviews && offer.reviews.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Customer Feedback
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Sample Demo Reviews
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {offer.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {rev.displayName}
                          </span>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600">{rev.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
