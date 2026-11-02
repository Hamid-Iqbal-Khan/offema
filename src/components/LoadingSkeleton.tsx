/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs animate-pulse"
        >
          {/* Visual header skeleton */}
          <div className="h-40 bg-slate-200" />

          {/* Body content skeleton */}
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-3 w-3 bg-slate-200 rounded-full" />
              <div className="h-3 w-16 bg-slate-200 rounded" />
            </div>

            <div className="space-y-1.5">
              <div className="h-5 w-4/5 bg-slate-200 rounded" />
              <div className="h-5 w-2/3 bg-slate-200 rounded" />
            </div>

            <div className="space-y-1">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-5/6 bg-slate-100 rounded" />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
