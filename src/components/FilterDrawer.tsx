/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, SlidersHorizontal, Info } from 'lucide-react';
import { FilterCriteria, OfferCategory } from '../domain/models/Offer';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: FilterCriteria;
  onApply: (newCriteria: FilterCriteria) => void;
  onReset: () => void;
  categories: OfferCategory[];
  isNearbySection: boolean;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  criteria,
  onApply,
  onReset,
  categories,
  isNearbySection,
}) => {
  const [localCriteria, setLocalCriteria] = useState<FilterCriteria>(criteria);

  // Sync state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setLocalCriteria(criteria);
    }
  }, [isOpen, criteria]);

  if (!isOpen) return null;

  const toggleCategory = (categoryId: string) => {
    setLocalCriteria((prev) => {
      const exists = prev.categoryIds.includes(categoryId);
      const nextIds = exists
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      return { ...prev, categoryIds: nextIds };
    });
  };

  const handleApply = () => {
    onApply(localCriteria);
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Handle */}
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 sm:hidden" />

          {/* Header */}
          <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Filter Offers</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close filter drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="px-6 py-4 overflow-y-auto space-y-6">
            {/* 1. Distance filter (Only applicable in Nearby / Local section) */}
            {isNearbySection && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Distance Radius
                  </label>
                  <span className="text-xs text-slate-500">
                    {localCriteria.maxDistanceKm ? `Within ${localCriteria.maxDistanceKm} km` : 'Any distance'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '1 km', value: 1 },
                    { label: '3 km', value: 3 },
                    { label: '5 km (Default)', value: 5 },
                    { label: '10 km', value: 10 },
                  ].map((preset) => {
                    const isSelected = localCriteria.maxDistanceKm === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() =>
                          setLocalCriteria((prev) => ({
                            ...prev,
                            maxDistanceKm: isSelected ? undefined : preset.value,
                          }))
                        }
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500">
                  Default discovery searches within 5 km of your location. Select a preset to narrow or expand.
                </p>
              </div>
            )}

            {/* 2. Offer Value / Margin Filter */}
            <div className="space-y-4 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Offer Value / Discount
                </label>
                <div
                  className="group relative cursor-help text-slate-400"
                  title="Percentage discounts and flat rupee amounts are filtered distinctly according to their specific value types without false equivalence."
                >
                  <Info size={13} />
                </div>
              </div>

              {/* Minimum Percentage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Minimum Percentage Off</span>
                  <span className="text-xs font-bold text-indigo-700">
                    {localCriteria.minPercentageValue ? `${localCriteria.minPercentageValue}%+` : 'Any %'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 50].map((pct) => {
                    const isSelected = localCriteria.minPercentageValue === pct;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() =>
                          setLocalCriteria((prev) => ({
                            ...prev,
                            minPercentageValue: isSelected ? undefined : pct,
                          }))
                        }
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pct}%+ Off
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minimum Fixed Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Minimum Flat Savings</span>
                  <span className="text-xs font-bold text-indigo-700">
                    {localCriteria.minFixedAmountValue ? `₹${localCriteria.minFixedAmountValue}+` : 'Any ₹'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[200, 400, 750, 1500].map((amt) => {
                    const isSelected = localCriteria.minFixedAmountValue === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() =>
                          setLocalCriteria((prev) => ({
                            ...prev,
                            minFixedAmountValue: isSelected ? undefined : amt,
                          }))
                        }
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ₹{amt}+
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Category Multi-Select Filter */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Categories
                </label>
                {localCriteria.categoryIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLocalCriteria((prev) => ({ ...prev, categoryIds: [] }))}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Clear categories
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = localCriteria.categoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <Check size={13} className="shrink-0" />}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset All</span>
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors cursor-pointer text-center"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
