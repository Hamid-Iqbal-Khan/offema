/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPinOff, SearchX, Globe, RotateCcw, Navigation, HeartOff } from 'lucide-react';

interface EmptyStateProps {
  type:
    | 'NO_LOCATION'
    | 'NO_NEARBY_OFFERS'
    | 'NO_FILTER_MATCHES'
    | 'NO_GLOBAL_OFFERS'
    | 'NO_SAVED_OFFERS';
  onClearFilters?: () => void;
  onUseDemoLocation?: () => void;
  onDetectLocation?: () => void;
  onSwitchToGlobal?: () => void;
  onSwitchToNearby?: () => void;
  onExpandRadius?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onClearFilters,
  onUseDemoLocation,
  onDetectLocation,
  onSwitchToGlobal,
  onSwitchToNearby,
  onExpandRadius,
}) => {
  if (type === 'NO_SAVED_OFFERS') {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-500 mb-4">
          <HeartOff size={26} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Saved Offers Yet</h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Tap the heart icon on any nearby or global offer card to save your preferred deals here for quick access.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onSwitchToNearby && (
            <button
              onClick={onSwitchToNearby}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
            >
              Explore Nearby Offers
            </button>
          )}
          {onSwitchToGlobal && (
            <button
              onClick={onSwitchToGlobal}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Browse Global Offers
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === 'NO_LOCATION') {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 mb-4">
          <Navigation size={26} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Location Required for Nearby Offers
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Nearby discovery calculates live geographic distance from your device to local merchants. Please enable location or test using our Hyderabad sample anchor.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onDetectLocation && (
            <button
              onClick={onDetectLocation}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
            >
              Allow Browser Location
            </button>
          )}
          {onUseDemoLocation && (
            <button
              onClick={onUseDemoLocation}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Use Demo Location
            </button>
          )}
        </div>
        {onSwitchToGlobal && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={onSwitchToGlobal}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Browse Global Online & Nationwide Offers →
            </button>
          </div>
        )}
      </div>
    );
  }

  if (type === 'NO_NEARBY_OFFERS') {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-600 mb-4">
          <MapPinOff size={26} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          No Local Offers in Active Radius
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          There are currently no active merchant offers within this distance radius of your coordinates.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onExpandRadius && (
            <button
              onClick={onExpandRadius}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
            >
              Expand Radius to 10 km
            </button>
          )}
          {onSwitchToGlobal && (
            <button
              onClick={onSwitchToGlobal}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
            >
              Explore Global Offers
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default: Filter matches empty
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500 mb-4">
        <SearchX size={26} />
      </div>
      <h3 className="text-lg font-bold text-slate-900">No Offers Found</h3>
      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
        We couldn&apos;t find any offers matching your exact combination of keyword, category, value, or distance filters.
      </p>
      {onClearFilters && (
        <div className="mt-6">
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Clear All Active Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
