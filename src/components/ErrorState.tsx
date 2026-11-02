/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Failed to load offers. Please check your network connection and try again.',
  onRetry,
}) => {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 sm:p-10 text-center max-w-md mx-auto shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto text-rose-600 mb-3">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-base font-bold text-rose-900">Unable to Load Offers</h3>
      <p className="text-xs text-rose-700 mt-1 leading-relaxed">{message}</p>
      <div className="mt-5">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      </div>
    </div>
  );
};
