/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Navigation, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { LocationResult } from '../services/location/LocationService';

interface LocationBannerProps {
  location: LocationResult | null;
  isLoading: boolean;
  error: string | null;
  onDetectBrowserLocation: () => void;
  onUseDemoLocation: () => void;
  onOpenGlobalTab: () => void;
  activeRadiusKm: number;
}

export const LocationBanner: React.FC<LocationBannerProps> = ({
  location,
  isLoading,
  error,
  onDetectBrowserLocation,
  onUseDemoLocation,
  onOpenGlobalTab,
  activeRadiusKm,
}) => {
  // Case 1: Location successfully active
  if (location) {
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 mt-0.5 text-indigo-300">
              <MapPin size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  Active Discovery Location
                </span>
                {location.source === 'DEMO_LOCATION' && (
                  <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                    Sample Anchor
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-white mt-0.5">
                {location.label}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Discovering physical merchants within a <strong className="text-slate-200">{activeRadiusKm} km default radius</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto pt-1 sm:pt-0">
            <button
              onClick={onDetectBrowserLocation}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
              title="Refresh GPS location"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh GPS</span>
            </button>
            {location.source !== 'DEMO_LOCATION' && (
              <button
                onClick={onUseDemoLocation}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-indigo-300 hover:text-indigo-200 hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                title="Switch to Demo Coordinates"
              >
                Use Demo Area
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Error or Denied State
  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 text-amber-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Location Access Needed for Nearby Discovery
              </h4>
              <p className="text-xs text-amber-700/90 mt-1 max-w-xl">
                {error} You can enable browser permissions, try our Hyderabad sample anchor, or browse nationwide Global Offers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onUseDemoLocation}
              className="px-3.5 py-2 text-xs font-medium text-amber-900 bg-amber-200 hover:bg-amber-300/80 rounded-lg transition-colors cursor-pointer"
            >
              Use Demo Location
            </button>
            <button
              onClick={onOpenGlobalTab}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-amber-200 rounded-lg transition-colors cursor-pointer"
            >
              Browse Global Offers
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Initial Prompt / Loading
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
            <Navigation size={20} className={isLoading ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Detect your location to see offers within 5 km
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              We calculate geographic distance from your browser coordinates. Sensitive coordinates stay in-memory for your session.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDetectBrowserLocation}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Navigation size={14} />
                <span>Allow Location</span>
              </>
            )}
          </button>
          <button
            onClick={onUseDemoLocation}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            Use Demo (Hyderabad)
          </button>
        </div>
      </div>
    </div>
  );
};
