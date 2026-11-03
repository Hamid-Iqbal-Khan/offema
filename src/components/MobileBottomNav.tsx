/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Globe, Heart, Map as MapIcon, UserRound } from 'lucide-react';

type Tab = 'NEARBY' | 'GLOBAL' | 'SAVED';

interface MobileBottomNavProps {
  activeTab: Tab;
  viewMode: 'grid' | 'map';
  onTabChange: (tab: Tab) => void;
  onToggleMap: () => void;
  onOpenProfile?: () => void;
  savedCount: number;
}

/** App-style bottom navigation for phones (hidden from the `sm` breakpoint up). */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  viewMode,
  onTabChange,
  onToggleMap,
  onOpenProfile,
  savedCount,
}) => {
  const item = (
    key: string,
    label: string,
    icon: React.ReactNode,
    active: boolean,
    onClick: () => void,
    badge?: number
  ) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-bold transition-colors cursor-pointer ${
        active ? 'text-indigo-600' : 'text-slate-500'
      }`}
    >
      <span
        className={`w-11 h-7 rounded-full flex items-center justify-center transition-colors ${
          active ? 'bg-indigo-100' : ''
        }`}
      >
        {icon}
      </span>
      {label}
      {badge ? (
        <span className="absolute top-1 right-[calc(50%-22px)] min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center tabular-nums">
          {badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <nav
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.15)]"
      style={{ paddingBottom: 'var(--sab)', paddingLeft: 'var(--sal)', paddingRight: 'var(--sar)' }}
      aria-label="Main navigation"
    >
      <div className="flex">
        {item('nearby', 'Nearby', <MapPin size={18} />, activeTab === 'NEARBY' && viewMode === 'grid', () => {
          onTabChange('NEARBY');
          if (viewMode === 'map') onToggleMap();
        })}
        {item('global', 'Global', <Globe size={18} />, activeTab === 'GLOBAL' && viewMode === 'grid', () => {
          onTabChange('GLOBAL');
          if (viewMode === 'map') onToggleMap();
        })}
        {item('map', 'Map', <MapIcon size={18} />, viewMode === 'map', onToggleMap)}
        {item('saved', 'Saved', <Heart size={18} />, activeTab === 'SAVED' && viewMode === 'grid', () => {
          onTabChange('SAVED');
          if (viewMode === 'map') onToggleMap();
        }, savedCount)}
        {onOpenProfile && item('profile', 'Account', <UserRound size={18} />, false, onOpenProfile)}
      </div>
    </nav>
  );
};
