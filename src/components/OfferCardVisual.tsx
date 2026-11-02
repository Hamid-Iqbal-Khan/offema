/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Shirt,
  Laptop,
  Sparkles,
  Dumbbell,
  Film,
  Wrench,
  Tag,
} from 'lucide-react';

interface OfferCardVisualProps {
  categoryId: string;
  categoryName: string;
  valueType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  currency?: string;
  className?: string;
  rightAction?: React.ReactNode;
  imageUrl?: string;
}

export const OfferCardVisual: React.FC<OfferCardVisualProps> = ({
  categoryId,
  categoryName,
  valueType,
  value,
  currency = '₹',
  className = 'h-40',
  rightAction,
  imageUrl,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const hasValidImage = Boolean(imageUrl && !imageError);

  // Get theme based on category
  const getTheme = () => {
    switch (categoryId) {
      case 'food-dining':
        return {
          bg: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 55%, #b45309 100%)',
          icon: Utensils,
          pattern: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 0%, transparent 40%)',
          accent: 'text-amber-100',
        };
      case 'grocery':
        return {
          bg: 'linear-gradient(135deg, #10b981 0%, #0f766e 55%, #064e3b 100%)',
          icon: ShoppingBag,
          pattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18) 0%, transparent 40%)',
          accent: 'text-emerald-100',
        };
      case 'fashion':
        return {
          bg: 'linear-gradient(135deg, #6366f1 0%, #7e22ce 55%, #312e81 100%)',
          icon: Shirt,
          pattern: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.15) 0%, transparent 40%)',
          accent: 'text-indigo-100',
        };
      case 'electronics':
        return {
          bg: 'linear-gradient(135deg, #334155 0%, #1e1b4b 55%, #0f172a 100%)',
          icon: Laptop,
          pattern: 'radial-gradient(circle at 70% 80%, rgba(255,255,255,0.15) 0%, transparent 40%)',
          accent: 'text-cyan-200',
        };
      case 'beauty-wellness':
        return {
          bg: 'linear-gradient(135deg, #f43f5e 0%, #db2777 55%, #9f1239 100%)',
          icon: Sparkles,
          pattern: 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)',
          accent: 'text-rose-100',
        };
      case 'health-fitness':
        return {
          bg: 'linear-gradient(135deg, #14b8a6 0%, #0e7490 55%, #134e4a 100%)',
          icon: Dumbbell,
          pattern: 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.18) 0%, transparent 40%)',
          accent: 'text-teal-100',
        };
      case 'entertainment':
        return {
          bg: 'linear-gradient(135deg, #a855f7 0%, #a21caf 55%, #4a044e 100%)',
          icon: Film,
          pattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.18) 0%, transparent 40%)',
          accent: 'text-purple-100',
        };
      case 'services':
        return {
          bg: 'linear-gradient(135deg, #3b82f6 0%, #0369a1 55%, #1e3a8a 100%)',
          icon: Wrench,
          pattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.15) 0%, transparent 40%)',
          accent: 'text-sky-100',
        };
      default:
        return {
          bg: 'linear-gradient(135deg, #475569 0%, #1e293b 55%, #0f172a 100%)',
          icon: Tag,
          pattern: 'none',
          accent: 'text-slate-100',
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  const valueDisplay =
    valueType === 'PERCENTAGE' ? `${value}% OFF` : `${currency === 'INR' ? '₹' : currency}${value.toLocaleString()} OFF`;

  return (
    <div
      className={`relative w-full overflow-hidden ${hasValidImage ? 'bg-slate-900' : ''} ${className} flex flex-col justify-between p-4 select-none`}
      style={
        !hasValidImage
          ? {
              // Pattern layered over the category gradient (both as background-image layers)
              backgroundImage: `${theme.pattern !== 'none' ? `${theme.pattern}, ` : ''}radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), ${theme.bg}`,
              backgroundSize: 'auto, 14px 14px, auto',
            }
          : undefined
      }
    >
      {/* Standardized Banner Image if present */}
      {hasValidImage && (
        <>
          <img
            src={imageUrl}
            alt={categoryName}
            onError={() => setImageError(true)}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          {/* Scrim Overlay for Contrast & Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-slate-950/60 pointer-events-none" />
        </>
      )}

      {/* Background ambient geometry (when no image) */}
      {!hasValidImage && (
        <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-20 text-white pointer-events-none rotate-[-12deg]">
          <IconComponent size={150} strokeWidth={1.25} />
        </div>
      )}

      {/* Top category label & actions */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white bg-black/25 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
          <IconComponent size={13} className={theme.accent} />
          <span>{categoryName}</span>
        </div>

        {rightAction}
      </div>

      {/* Center value callout */}
      <div className="relative z-10 my-auto">
        <div className="inline-flex items-baseline gap-1.5 rounded-2xl bg-white/95 px-3.5 py-1.5 shadow-lg shadow-black/20 ring-1 ring-white/60">
          <span className="text-2xl sm:text-[1.7rem] font-extrabold tracking-tight text-slate-900 tabular-nums leading-none">
            {valueDisplay.replace(' OFF', '')}
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-600">off</span>
        </div>
      </div>

      {/* Bottom subtle shine line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/10 via-white/40 to-transparent z-10" />
    </div>
  );
};
