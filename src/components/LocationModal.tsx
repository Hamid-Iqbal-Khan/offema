/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, MapPin, Navigation, Compass, Trash2, Check } from 'lucide-react';
import { LocationResult } from '../services/location/LocationService';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationResult | null;
  onDetectBrowserLocation: () => void;
  onUseDemoLocation: (city?: 'HYD' | 'BLR') => void;
  onClearLocation: () => void;
  isLoading: boolean;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onDetectBrowserLocation,
  onUseDemoLocation,
  onClearLocation,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Location Settings</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Current Status */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Current Location
            </span>
            <div className="flex items-center gap-2 mt-1">
              <MapPin size={16} className="text-indigo-600 shrink-0" />
              <span className="text-sm font-bold text-slate-900">
                {currentLocation ? currentLocation.label : 'Not configured'}
              </span>
            </div>
            {currentLocation && (
              <p className="text-[11px] text-slate-500 mt-1">
                Source: {currentLocation.source === 'BROWSER_GPS' ? 'Device GPS Sensor' : 'Demo Anchor'}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            <button
              onClick={() => {
                onDetectBrowserLocation();
                onClose();
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <Navigation size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                    Use Real Browser GPS
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Calculates distance from your actual physical coordinates.
                  </p>
                </div>
              </div>
              {currentLocation?.source === 'BROWSER_GPS' && (
                <Check size={16} className="text-indigo-600 shrink-0 ml-2" />
              )}
            </button>

            <button
              onClick={() => {
                onUseDemoLocation('HYD');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-800">
                    Use Demo Location (Hyderabad)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Banjara Hills (17.4156° N, 78.4350° E) for exploring seeded local offers.
                  </p>
                </div>
              </div>
              {currentLocation?.source === 'DEMO_LOCATION' && currentLocation.label.includes('Hyderabad') && (
                <Check size={16} className="text-amber-600 shrink-0 ml-2" />
              )}
            </button>

            <button
              onClick={() => {
                onUseDemoLocation('BLR');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-800">
                    Use Demo Location (Bengaluru)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Koramangala (12.9352° N, 77.6245° E) for exploring Bengaluru sample offers.
                  </p>
                </div>
              </div>
              {currentLocation?.source === 'DEMO_LOCATION' && currentLocation.label.includes('Bengaluru') && (
                <Check size={16} className="text-amber-600 shrink-0 ml-2" />
              )}
            </button>

            {currentLocation && (
              <button
                onClick={() => {
                  onClearLocation();
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Clear Location (Test No-Location State)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
