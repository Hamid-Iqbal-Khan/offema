/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Globe, Clock } from 'lucide-react';
import { OfferWithDistance } from '../domain/models/Offer';
import { getCategoryTheme } from '../config/categoryTheme';
import { getTimeRemaining } from '../domain/logic/offerValidity';

interface DealRailProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  offers: OfferWithDistance[];
  onSelect: (offer: OfferWithDistance) => void;
  accent?: 'rose' | 'indigo';
  actionLabel?: string;
  onAction?: () => void;
}

const formatValue = (o: OfferWithDistance) =>
  o.valueType === 'PERCENTAGE' ? `${o.value}%` : `₹${o.value.toLocaleString('en-IN')}`;

/** Horizontal, swipeable strip of compact deal tiles (e.g. "Ending today", "Recently viewed"). */
export const DealRail: React.FC<DealRailProps> = ({
  title,
  subtitle,
  icon,
  offers,
  onSelect,
  accent = 'indigo',
  actionLabel,
  onAction,
}) => {
  if (offers.length === 0) return null;

  return (
    <section className="space-y-2.5" aria-label={title}>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              accent === 'rose' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">{title}</h2>
            {subtitle && <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>}
          </div>
        </div>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 shrink-0 cursor-pointer"
          >
            {actionLabel}
          </button>
        )}
      </div>

      <div className="-mx-4 sm:mx-0">
        <div className="flex gap-3 overflow-x-auto px-4 sm:px-0 pb-2 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {offers.map((offer) => {
            const theme = getCategoryTheme(offer.categoryId, offer.categoryName);
            const Icon = theme.icon;
            const remaining = getTimeRemaining(offer.validUntil);
            const urgent = remaining.days === 0 && !remaining.isExpired;
            return (
              <button
                key={offer.id}
                type="button"
                onClick={() => onSelect(offer)}
                className="snap-start shrink-0 w-[244px] text-left bg-white rounded-2xl border border-slate-200/80 p-3 flex gap-3 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 transition-all cursor-pointer"
              >
                <span
                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${theme.bubble}`}
                >
                  <Icon size={14} className="opacity-80" />
                  <span className="text-[13px] font-extrabold leading-tight tabular-nums">{formatValue(offer)}</span>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest opacity-80">off</span>
                </span>
                <span className="min-w-0 flex-1 flex flex-col justify-between">
                  <span className="block text-[11px] font-semibold text-slate-500 truncate">{offer.providerName}</span>
                  <span className="block text-xs font-bold text-slate-900 leading-snug line-clamp-2">{offer.title}</span>
                  <span className="flex items-center gap-2 text-[10px] font-semibold mt-0.5">
                    {urgent ? (
                      <span className="inline-flex items-center gap-1 text-rose-600">
                        <Clock size={10} /> {remaining.formattedCompact} left
                      </span>
                    ) : offer.scope === 'LOCAL' ? (
                      <span className="inline-flex items-center gap-1 text-indigo-600">
                        <MapPin size={10} /> {offer.formattedDistance || 'Nearby'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <Globe size={10} /> Online
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
