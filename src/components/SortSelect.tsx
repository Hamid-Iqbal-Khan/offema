/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { SortOption } from '../domain/models/Offer';

interface SortSelectProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
  hasLocation: boolean;
}

export const SortSelect: React.FC<SortSelectProps> = ({
  value,
  onChange,
  hasLocation,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 font-medium hidden sm:inline flex-shrink-0">
        Sort by:
      </span>
      <div className="relative inline-flex items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-2 pl-3 pr-8 rounded-xl shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors cursor-pointer"
        >
          <option value="HIGHEST_OFFER">Highest Offer (Default)</option>
          <option value="LOWEST_OFFER">Lowest Offer</option>
          <option value="NEAREST" disabled={!hasLocation}>
            Nearest Distance {!hasLocation ? '(Location Required)' : ''}
          </option>
          <option value="NEWEST">Newest Valid</option>
        </select>
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
          <ArrowUpDown size={13} />
        </div>
      </div>
    </div>
  );
};
