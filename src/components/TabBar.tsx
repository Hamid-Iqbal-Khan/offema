/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Globe, Heart } from 'lucide-react';

interface TabBarProps {
  activeTab: 'NEARBY' | 'GLOBAL' | 'SAVED';
  onTabChange: (tab: 'NEARBY' | 'GLOBAL' | 'SAVED') => void;
  nearbyCount: number;
  globalCount: number;
  savedCount: number;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
  nearbyCount,
  globalCount,
  savedCount,
}) => {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl border border-slate-200 w-full sm:w-auto">
      <button
        onClick={() => onTabChange('NEARBY')}
        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
          activeTab === 'NEARBY'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
        }`}
      >
        <MapPin size={14} className={activeTab === 'NEARBY' ? 'text-indigo-600' : 'text-slate-500'} />
        <span>Nearby</span>
        <span
          className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
            activeTab === 'NEARBY' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-300/60 text-slate-700'
          }`}
        >
          {nearbyCount}
        </span>
      </button>

      <button
        onClick={() => onTabChange('GLOBAL')}
        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
          activeTab === 'GLOBAL'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
        }`}
      >
        <Globe size={14} className={activeTab === 'GLOBAL' ? 'text-indigo-600' : 'text-slate-500'} />
        <span>Global</span>
        <span
          className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
            activeTab === 'GLOBAL' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-300/60 text-slate-700'
          }`}
        >
          {globalCount}
        </span>
      </button>

      <button
        onClick={() => onTabChange('SAVED')}
        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
          activeTab === 'SAVED'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
        }`}
      >
        <Heart
          size={14}
          className={activeTab === 'SAVED' ? 'text-rose-600 fill-rose-600' : 'text-slate-500'}
        />
        <span>Saved</span>
        {savedCount > 0 && (
          <span
            className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
              activeTab === 'SAVED' ? 'bg-rose-50 text-rose-700' : 'bg-slate-300/60 text-slate-700'
            }`}
          >
            {savedCount}
          </span>
        )}
      </button>
    </div>
  );
};
