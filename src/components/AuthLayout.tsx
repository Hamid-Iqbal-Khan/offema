/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Timer, BellRing, Heart } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useSystemBarStyle } from '../hooks/useSystemBarStyle';

const VALUE_POINTS = [
  { icon: MapPin, title: 'Deals around the corner', text: 'Live offers from shops within walking distance.' },
  { icon: Timer, title: 'Never miss a flash deal', text: 'Countdowns show exactly how long each offer lasts.' },
  { icon: Heart, title: 'Save what you love', text: 'Bookmark offers and come back before they expire.' },
  { icon: BellRing, title: 'For local businesses too', text: 'Post a campaign and reach nearby shoppers in minutes.' },
];

/**
 * Two-column shell for the sign-in & OTP screens: brand story on the left (desktop),
 * compact brand strip on top (phones), and the form column on the right.
 */
export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useSystemBarStyle('light-content');
  return (
  <div className="min-h-screen pb-[var(--sab)] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] bg-slate-50">
    {/* Brand panel */}
    <aside className="relative overflow-hidden text-white bg-[linear-gradient(140deg,#4338ca_0%,#6d28d9_55%,#7c3aed_100%)]">
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-fuchsia-400/30 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Phone: compact strip */}
      <div className="relative lg:hidden px-5 pt-[calc(1.5rem+var(--sat))] pb-5">
        <BrandLogo size={32} tone="light" />
        <p className="mt-3 text-lg font-extrabold leading-snug">Local deals, live around you.</p>
        <p className="text-xs text-indigo-100/90 mt-1">Discover offers nearby, save favourites, and catch flash deals in time.</p>
      </div>

      {/* Desktop: full story */}
      <div className="relative hidden lg:flex h-full flex-col justify-between p-12 xl:p-16">
        <BrandLogo size={38} tone="light" />

        <div className="space-y-8 max-w-md">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" /> Live in your city
            </p>
            <h2 className="mt-3 text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.05]">
              Local deals,
              <br />
              live around you.
            </h2>
            <p className="mt-4 text-base text-indigo-100/90 leading-relaxed">
              Offema brings every discount from the cafés, salons, gyms and stores near you into one simple feed.
            </p>
          </div>

          <ul className="space-y-4">
            {VALUE_POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-amber-200" />
                </span>
                <span>
                  <span className="block text-sm font-bold">{title}</span>
                  <span className="block text-xs text-indigo-100/85">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sample floating deal */}
        <div className="flex items-center gap-3 self-start rounded-2xl bg-white/95 text-slate-900 p-3 pr-5 shadow-2xl shadow-indigo-950/40 rotate-[-2deg]">
          <span className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex flex-col items-center justify-center font-extrabold leading-none">
            <span className="text-sm">30%</span>
            <span className="text-[8px] tracking-widest">OFF</span>
          </span>
          <span>
            <span className="block text-[11px] font-semibold text-slate-500">830 m away · ends in 5h</span>
            <span className="block text-sm font-bold">Artisanal coffee &amp; fresh bakes</span>
          </span>
        </div>
      </div>
    </aside>

    {/* Form column */}
    <div className="min-w-0">{children}</div>
  </div>
);
};
