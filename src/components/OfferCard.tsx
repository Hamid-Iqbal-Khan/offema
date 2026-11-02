/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Globe, Clock, Share2, Check, Heart } from 'lucide-react';
import { OfferWithDistance } from '../domain/models/Offer';
import { OfferCardVisual } from './OfferCardVisual';
import { CountdownTimer } from './CountdownTimer';
import { formatValidityPeriod, isExpiringSoon } from '../domain/logic/offerValidity';

interface OfferCardProps {
  offer: OfferWithDistance;
  onSelect: (offer: OfferWithDistance) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (offerId: string) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  const isLocal = offer.scope === 'LOCAL';
  const expiringSoon = isExpiringSoon(offer);
  const validityText = formatValidityPeriod(offer);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(offer.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const formattedValue =
      offer.valueType === 'PERCENTAGE'
        ? `${offer.value}% OFF`
        : `${offer.currency === 'INR' ? '₹' : offer.currency || '₹'}${offer.value.toLocaleString()} OFF`;

    const shareData = {
      title: `${formattedValue} - ${offer.title}`,
      text: `Check out this offer from ${offer.providerName}: ${offer.title} (${formattedValue})${
        offer.promoCode ? ` with code ${offer.promoCode}` : ''
      }!`,
      url: window.location.href,
    };

    // Use Web Share API if available
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: unknown) {
        // User aborted share sheet; do not fallback to clipboard copy
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }

    // Fallback: Copy link and offer details to clipboard
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        const textToCopy = `${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // Clipboard access denied or unavailable
    }
  };

  return (
    <article
      onClick={() => onSelect(offer)}
      className="group bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-200 shadow-sm shadow-slate-200/60 hover:shadow-xl hover:shadow-indigo-100/60 hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(offer);
        }
      }}
    >
      {/* Visual Header with Standardized Banner or Category Theme, Value Badge & Floating Favorite Button */}
      <OfferCardVisual
        categoryId={offer.categoryId}
        categoryName={offer.categoryName}
        valueType={offer.valueType}
        value={offer.value}
        currency={offer.currency}
        imageUrl={offer.bannerImageUrl || (offer.imageUrls && offer.imageUrls.length > 0 ? offer.imageUrls[0] : undefined)}
        rightAction={
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={
              isFavorite
                ? `Remove ${offer.title} from favorites`
                : `Save ${offer.title} to favorites`
            }
            title={isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 ${
              isFavorite
                ? 'bg-white text-rose-600 shadow-md scale-105'
                : 'bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs'
            }`}
          >
            <Heart
              size={15}
              className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}
            />
          </button>
        }
      />

      {/* Visual Countdown Timer for Urgency */}
      <CountdownTimer validUntil={offer.validUntil} variant="strip" />

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {/* Metadata line: Merchant avatar · Name and compact actions (Save + Share) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                aria-hidden="true"
                className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 text-[11px] font-extrabold flex items-center justify-center shrink-0 ring-1 ring-indigo-200/70"
              >
                {offer.providerName.trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 leading-tight">
                <span className="block text-xs font-bold text-slate-900 truncate">{offer.providerName}</span>
                <span className="block text-[11px] text-slate-500 truncate">{offer.categoryName}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleToggleFavorite}
                aria-label={
                  isFavorite
                    ? `Remove ${offer.title} from favorites`
                    : `Save ${offer.title} to favorites`
                }
                title={isFavorite ? 'Remove from saved' : 'Save deal'}
                className={`w-8 h-8 inline-flex items-center justify-center rounded-full transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  isFavorite
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <Heart size={15} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
              </button>

              <button
                type="button"
                onClick={handleShare}
                aria-label={`Share offer: ${offer.title}`}
                title={copied ? 'Copied to clipboard' : 'Share deal'}
                className={`w-8 h-8 inline-flex items-center justify-center rounded-full transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  copied
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                {copied ? <Check size={15} /> : <Share2 size={15} />}
              </button>
            </div>
          </div>

          {/* Offer Title */}
          <h3 className="pt-1 text-[15px] font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2 leading-snug">
            {offer.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {offer.description}
          </p>
        </div>

        {/* Bottom Section: Location / Scope & Validity */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          {/* Location / Scope */}
          <div className="flex items-center gap-1.5 truncate">
            {isLocal ? (
              <>
                <MapPin size={14} className="text-indigo-600 shrink-0" />
                <span className="font-bold text-indigo-700">
                  {offer.formattedDistance ? `${offer.formattedDistance} away` : 'Nearby'}
                </span>
                {offer.location?.label && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="truncate text-slate-500">{offer.location.label}</span>
                  </>
                )}
              </>
            ) : (
              <>
                <Globe size={14} className="text-emerald-600 shrink-0" />
                <span className="font-semibold text-emerald-800">
                  {offer.scope === 'ONLINE'
                    ? 'Online Only'
                    : offer.scope === 'NATIONAL'
                    ? 'Pan-India Delivery'
                    : 'All Outlets Nationally'}
                </span>
              </>
            )}
          </div>

          {/* Expiry label */}
          <div
            className={`flex items-center gap-1 shrink-0 ${
              expiringSoon ? 'text-amber-700 font-semibold' : 'text-slate-500'
            }`}
          >
            <Clock size={12} className={expiringSoon ? 'text-amber-600' : 'text-slate-400'} />
            <span className="text-[11px]">{validityText}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
