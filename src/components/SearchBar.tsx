/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onOpenFilterDrawer: () => void;
  activeFilterCount: number;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onOpenFilterDrawer,
  activeFilterCount,
  placeholder = 'Search offers, stores, categories (e.g. coffee, spa, kurta)...',
}) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
        />
        {value.length > 0 && (
          <button
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <button
        onClick={onOpenFilterDrawer}
        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border transition-all cursor-pointer shrink-0 ${
          activeFilterCount > 0
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold shadow-xs'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
        title="Open Filters"
      >
        <SlidersHorizontal size={15} />
        <span className="hidden sm:inline">Filters</span>
        {activeFilterCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center tabular-nums">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
};
