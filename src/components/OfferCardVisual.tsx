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
          bg: 'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700',
          icon: Utensils,
          pattern: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 0%, transparent 40%)',
          accent: 'text-amber-100',
        };
      case 'grocery':
        return {
          bg: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900',
          icon: ShoppingBag,
          pattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18) 0%, transparent 40%)',
          accent: 'text-emerald-100',
        };
      case 'fashion':
        return {
          bg: 'bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900',
          icon: Shirt,
          pattern: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.15) 0%, transparent 40%)',
          accent: 'text-indigo-100',
        };
      case 'electronics':
        return {
          bg: 'bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900',
          icon: Laptop,
          pattern: 'radial-gradient(circle at 70% 80%, rgba(255,255,255,0.15) 0%, transparent 40%)',
          accent: 'text-cyan-200',
        };
      case 'beauty-wellness':
        return {
          bg: 'bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700',
          icon: Sparkles,
          pattern: 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)',
          accent: 'text-rose-100',
        };
      case 'health-fitness':
        return {
          bg: 'bg-gradient-to-br from-teal-600 via-cyan-700 to-teal-900',
          icon: Dumbbell,
          pattern: 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.18) 0%, transparent 40%)',
          accent: 'text-teal-100',
        };
      case 'entertainment':
        return {
          bg: 'bg-gradient-to-br from-purple-700 via-fuchsia-800 to-purple-950',
          icon: Film,
          pattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.18) 0%, transparent 40%)',
          accent: 'text-purple-100',
        };
      case 'services':
        return {
          bg: 'bg-gradient-to-br from-blue-600 via-sky-700 to-blue-900',
          icon: Wrench,
          pattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.15) 0%, transparent 40%)',
          accent: 'text-sky-100',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900',
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
      className={`relative w-full overflow-hidden ${hasValidImage ? 'bg-slate-900' : theme.bg} ${className} flex flex-col justify-between p-4 select-none`}
      style={{ backgroundImage: !hasValidImage ? theme.pattern : undefined }}
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
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-15 pointer-events-none">
          <IconComponent size={140} strokeWidth={1} />
        </div>
      )}

      {/* Top category label & actions */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/95 drop-shadow-sm bg-black/35 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
          <IconComponent size={13} className={theme.accent} />
          <span>{categoryName}</span>
        </div>

        {rightAction}
      </div>

      {/* Center value callout */}
      <div className="relative z-10 my-auto">
        <div className="inline-block rounded-xl bg-black/55 backdrop-blur-md px-3.5 py-1.5 border border-white/25 shadow-lg">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white tabular-nums drop-shadow-sm">
            {valueDisplay}
          </span>
        </div>
      </div>

      {/* Bottom subtle shine line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/10 via-white/40 to-transparent z-10" />
    </div>
  );
};
