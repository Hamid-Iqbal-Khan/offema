/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BrandLogoProps {
  size?: number;
  showWordmark?: boolean;
  tone?: 'dark' | 'light';
  className?: string;
}

/** Offema brand mark (pin + sparkle) with optional wordmark. Matches /public/icon.svg. */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 30,
  showWordmark = true,
  tone = 'dark',
  className = '',
}) => (
  <span className={`inline-flex items-center gap-2 select-none ${className}`}>
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true" className="shrink-0 drop-shadow-sm">
      <defs>
        <linearGradient id="offemaBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="offemaAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="128" fill={tone === 'light' ? '#ffffff' : 'url(#offemaBg)'} />
      <path
        d="M256 100 C184.2 100 126 158.2 126 230 C126 312 256 420 256 420 C256 420 386 312 386 230 C386 158.2 327.8 100 256 100 Z"
        fill={tone === 'light' ? 'url(#offemaBg)' : 'white'}
      />
      <circle cx="256" cy="230" r="64" fill={tone === 'light' ? '#ffffff' : 'url(#offemaBg)'} />
      <path d="M256 195 L266 220 L291 230 L266 240 L256 265 L246 240 L221 230 L246 220 Z" fill="url(#offemaAccent)" />
    </svg>
    {showWordmark && (
      <span
        className={`text-lg sm:text-xl font-extrabold tracking-tight leading-none ${
          tone === 'light' ? 'text-white' : 'text-slate-900'
        }`}
      >
        Offema
      </span>
    )}
  </span>
);
