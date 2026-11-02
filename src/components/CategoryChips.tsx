/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { OfferCategory } from '../domain/models/Offer';
import { getCategoryTheme } from '../config/categoryTheme';

interface CategoryChipsProps {
  categories: OfferCategory[];
  /** Number of offers per category in the current tab (chips with 0 are dimmed) */
  counts: Record<string, number>;
  selectedIds: string[];
  onToggle: (categoryId: string) => void;
  onClear: () => void;
}

/** One-tap category shortcuts. Uses the same multi-select filter as the Filters drawer. */
export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  counts,
  selectedIds,
  onToggle,
  onClear,
}) => {
  const sorted = [...categories]
    .filter((c) => c.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const allSelected = selectedIds.length === 0;

  return (
    <div className="-mx-4 sm:mx-0" role="group" aria-label="Quick category filters">
      <div className="flex gap-2 overflow-x-auto px-4 sm:px-0 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
        <button
          type="button"
          onClick={onClear}
          aria-pressed={allSelected}
          className={`snap-start shrink-0 inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
            allSelected
              ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/15'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center ${
              allSelected ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <LayoutGrid size={14} />
          </span>
          All deals
        </button>

        {sorted.map((cat) => {
          const theme = getCategoryTheme(cat.id, cat.name);
          const Icon = theme.icon;
          const selected = selectedIds.includes(cat.id);
          const count = counts[cat.id] || 0;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggle(cat.id)}
              aria-pressed={selected}
              title={cat.name}
              className={`snap-start shrink-0 inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                selected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25'
                  : count === 0
                  ? 'bg-white text-slate-400 border-slate-200/70'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200 hover:text-indigo-700'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  selected ? 'bg-white/20 text-white' : theme.bubble
                } ${count === 0 && !selected ? 'opacity-60' : ''}`}
              >
                <Icon size={14} />
              </span>
              <span>{theme.short}</span>
              <span
                className={`tabular-nums text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
