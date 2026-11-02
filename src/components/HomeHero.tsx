/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, RefreshCw, Flame, BadgePercent, Store, Heart } from 'lucide-react';
import { AuthUser } from '../domain/models/Offer';
import { LocationResult } from '../services/location/LocationService';

interface HomeHeroProps {
  user: AuthUser | null;
  location: LocationResult | null;
  isLoadingLocation: boolean;
  activeRadiusKm: number;
  nearbyCount: number;
  bestDiscountLabel?: string;
  endingTodayCount: number;
  savedCount: number;
  onRefreshLocation: () => void;
  onUseDemoLocation: () => void;
  onOpenLocationModal: () => void;
  onOpenSaved: () => void;
  onOpenEndingToday: () => void;
}

const greetingFor = (hour: number) =>
  hour < 5 ? 'Hello, night owl' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

/** Only greet by a real first name (skip generated placeholders like "User (3210)"). */
const firstNameOf = (displayName?: string) => {
  const first = displayName?.trim().split(/\s+/)[0];
  if (!first || /^(user|advertizer|advertiser|authorized|admin|guest)$/i.test(first)) return undefined;
  return first;
};

/**
 * Personal welcome strip at the top of the feed: greeting, active discovery
 * location (with Refresh GPS / Demo area actions) and at-a-glance stats.
 */
export const HomeHero: React.FC<HomeHeroProps> = ({
  user,
  location,
  isLoadingLocation,
  activeRadiusKm,
  nearbyCount,
  bestDiscountLabel,
  endingTodayCount,
  savedCount,
  onRefreshLocation,
  onUseDemoLocation,
  onOpenLocationModal,
  onOpenSaved,
  onOpenEndingToday,
}) => {
  const hour = new Date().getHours();
  const greeting = greetingFor(hour);
  const name = hour < 5 ? undefined : firstNameOf(user?.displayName);
  

  const stats = [
    { icon: <Store size={14} />, value: nearbyCount, label: `nearby · ${activeRadiusKm} km`, onClick: undefined },
    { icon: <BadgePercent size={14} />, value: bestDiscountLabel || '—', label: 'best deal', onClick: undefined },
    { icon: <Flame size={14} />, value: endingTodayCount, label: 'ending today', onClick: onOpenEndingToday },
    { icon: <Heart size={14} />, value: savedCount, label: 'saved', onClick: onOpenSaved },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl text-white shadow-xl shadow-indigo-600/20 bg-[linear-gradient(135deg,#4f46e5_0%,#6d28d9_55%,#7c3aed_100%)]">
      {/* decorative glows */}
      <div className="pointer-events-none absolute -top-16 -right-10 w-56 h-56 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-fuchsia-400/25 blur-3xl" />

      <div className="relative p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-indigo-100/90">
              {greeting}
              {name ? `, ${name}` : ''} 👋
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
              Deals worth stepping out for
            </h1>
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-white/95 bg-white/15 hover:bg-white/25 border border-white/20 rounded-full pl-2 pr-3 py-1 transition-colors cursor-pointer max-w-full"
              title="Change discovery location"
            >
              <MapPin size={13} className="shrink-0 text-amber-300" />
              <span className="truncate">{location ? location.label : 'Set your location'}</span>
              {location?.source === 'DEMO_LOCATION' && (
                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-amber-300 text-amber-950 px-1.5 py-0.5 rounded-full">
                  Sample
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefreshLocation}
              disabled={isLoadingLocation}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-60"
              title="Refresh GPS location"
            >
              <RefreshCw size={13} className={isLoadingLocation ? 'animate-spin' : ''} />
              Refresh GPS
            </button>
            {location?.source !== 'DEMO_LOCATION' && (
              <button
                type="button"
                onClick={onUseDemoLocation}
                className="px-3 py-2 text-xs font-bold text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Switch to the Hyderabad sample area"
              >
                Use Demo Area
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {stats.map((s) => {
            const content = (
              <>
                <span className="hidden sm:flex w-7 h-7 rounded-lg bg-white/15 items-center justify-center shrink-0 text-amber-200">
                  {s.icon}
                </span>
                <span className="min-w-0 text-center sm:text-left leading-tight">
                  <span className="block text-base font-extrabold tabular-nums">{s.value}</span>
                  <span className="block text-[10px] font-semibold text-indigo-100/90 sm:truncate">{s.label}</span>
                </span>
              </>
            );
            const cls =
              'flex items-center justify-center sm:justify-start gap-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm px-1.5 sm:px-3 py-2 sm:py-2.5';
            return s.onClick ? (
              <button
                key={s.label}
                type="button"
                onClick={s.onClick}
                className={`${cls} hover:bg-white/20 transition-colors cursor-pointer`}
              >
                {content}
              </button>
            ) : (
              <div key={s.label} className={cls}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
