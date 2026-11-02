/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Clock, Zap, AlertCircle } from 'lucide-react';
import { useCountdown } from './useCountdown';

interface CountdownTimerProps {
  validUntil: string;
  variant?: 'strip' | 'badge' | 'segmented';
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  validUntil,
  variant = 'strip',
  className = '',
}) => {
  const { days, hours, minutes, seconds, isExpired, urgencyLevel, formattedCompact } =
    useCountdown(validUntil);

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Case: Expired
  if (isExpired) {
    if (variant === 'badge') {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-600 ${className}`}
        >
          <AlertCircle size={12} />
          <span>Expired</span>
        </span>
      );
    }
    return (
      <div
        className={`w-full py-1.5 px-4 bg-slate-100 border-b border-slate-200 text-slate-500 text-xs font-semibold flex items-center justify-between ${className}`}
      >
        <span className="flex items-center gap-1.5">
          <AlertCircle size={13} />
          <span>Offer Expired</span>
        </span>
        <span className="font-mono text-[11px]">Ended</span>
      </div>
    );
  }

  // Variant 1: Segmented Units (Great for Offer Details Modal)
  if (variant === 'segmented') {
    const isCritical = urgencyLevel === 'CRITICAL';
    const isUrgent = urgencyLevel === 'URGENT';

    return (
      <div
        className={`p-4 rounded-2xl border ${
          isCritical
            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
            : isUrgent
            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
            : 'bg-slate-50 border-slate-200 text-slate-900'
        } ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            {isCritical ? (
              <>
                <Flame size={15} className="text-rose-600" />
                <span className="text-rose-700">Urgent Flash Deal Ends Soon</span>
              </>
            ) : isUrgent ? (
              <>
                <Zap size={15} className="text-amber-600" />
                <span className="text-amber-800">Limited-Time Offer Ending Soon</span>
              </>
            ) : (
              <>
                <Clock size={15} className="text-indigo-600" />
                <span className="text-slate-700">Time Remaining to Claim</span>
              </>
            )}
          </div>
          <span className="text-[11px] font-medium text-slate-500">Live Timer</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {/* Days */}
          <div className="bg-white rounded-xl p-2.5 shadow-2xs border border-slate-200/80">
            <div className="text-lg sm:text-2xl font-black font-mono tabular-nums text-slate-900">
              {pad(days)}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Days
            </div>
          </div>

          {/* Hours */}
          <div className="bg-white rounded-xl p-2.5 shadow-2xs border border-slate-200/80">
            <div className="text-lg sm:text-2xl font-black font-mono tabular-nums text-slate-900">
              {pad(hours)}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Hours
            </div>
          </div>

          {/* Minutes */}
          <div className="bg-white rounded-xl p-2.5 shadow-2xs border border-slate-200/80">
            <div className="text-lg sm:text-2xl font-black font-mono tabular-nums text-slate-900">
              {pad(minutes)}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Mins
            </div>
          </div>

          {/* Seconds */}
          <div className="bg-white rounded-xl p-2.5 shadow-2xs border border-slate-200/80">
            <div
              className={`text-lg sm:text-2xl font-black font-mono tabular-nums ${
                isCritical ? 'text-rose-600' : isUrgent ? 'text-amber-600' : 'text-indigo-600'
              }`}
            >
              {pad(seconds)}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Secs
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variant 2: Compact Badge
  if (variant === 'badge') {
    if (urgencyLevel === 'CRITICAL') {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono tabular-nums bg-rose-600 text-white shadow-xs ${className}`}
        >
          <Flame size={12} className="text-amber-300" />
          <span>{formattedCompact}</span>
        </span>
      );
    }

    if (urgencyLevel === 'URGENT') {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono tabular-nums bg-amber-500 text-slate-950 shadow-xs ${className}`}
        >
          <Zap size={12} className="text-slate-950" />
          <span>{formattedCompact}</span>
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium font-mono tabular-nums bg-slate-900/80 backdrop-blur-xs text-white ${className}`}
      >
        <Clock size={12} className="text-slate-300" />
        <span>{formattedCompact}</span>
      </span>
    );
  }

  // Variant 3: Default Strip Banner across the Card
  if (urgencyLevel === 'CRITICAL') {
    return (
      <div
        className={`w-full py-1.5 px-4 bg-gradient-to-r from-rose-50 via-rose-100/70 to-rose-50 border-b border-rose-200/80 text-rose-900 text-xs font-bold flex items-center justify-between transition-colors ${className}`}
      >
        <div className="flex items-center gap-1.5">
          <Flame size={14} className="text-rose-600 shrink-0" />
          <span className="uppercase tracking-wider text-[11px] text-rose-700">
            Flash Deal
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono tabular-nums tracking-wider text-rose-950 font-extrabold text-[12px]">
          <span>Ends in</span>
          <span className="bg-rose-200/80 px-1.5 py-0.5 rounded text-rose-950">
            {formattedCompact}
          </span>
        </div>
      </div>
    );
  }

  if (urgencyLevel === 'URGENT') {
    return (
      <div
        className={`w-full py-1.5 px-4 bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 border-b border-amber-200/80 text-amber-950 text-xs font-semibold flex items-center justify-between transition-colors ${className}`}
      >
        <div className="flex items-center gap-1.5">
          <Zap size={14} className="text-amber-600 shrink-0" />
          <span className="uppercase tracking-wider text-[11px] text-amber-800">
            Limited Time
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono tabular-nums tracking-wider text-amber-950 font-bold text-[12px]">
          <span>Ends in</span>
          <span className="bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-950">
            {formattedCompact}
          </span>
        </div>
      </div>
    );
  }

  // Normal (> 48 hours)
  return (
    <div
      className={`w-full py-1.5 px-4 bg-slate-50 border-b border-slate-100 text-slate-700 text-xs font-medium flex items-center justify-between transition-colors ${className}`}
    >
      <div className="flex items-center gap-1.5 text-slate-500">
        <Clock size={13} className="text-slate-400 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-600">Expires in</span>
      </div>
      <div className="font-mono tabular-nums tracking-wider text-slate-800 font-bold text-[11px]">
        {formattedCompact}
      </div>
    </div>
  );
};
