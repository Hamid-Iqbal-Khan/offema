/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthUser } from '../domain/models/Offer';
import { BrandLogo } from './BrandLogo';
import {
  LogOut,
  MapPin,
  Sparkles,
  User as UserIcon,
  Megaphone,
  Shield,
  Bell,
  Plus,
} from 'lucide-react';

interface AppHeaderProps {
  user: AuthUser | null;
  onLogout: () => void;
  locationLabel?: string;
  onOpenLocationModal: () => void;
  onOpenDemoInfo: () => void;
  activeTab: 'NEARBY' | 'GLOBAL' | 'SAVED';
  onTabChange: (tab: 'NEARBY' | 'GLOBAL' | 'SAVED') => void;
  onOpenProfile?: () => void;
  onOpenAdvertizerDashboard?: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenNotifications?: () => void;
  onOpenSubmitAd?: () => void;
  unreadNotificationsCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  onLogout,
  locationLabel,
  onOpenLocationModal,
  onOpenDemoInfo,
  onTabChange,
  onOpenProfile,
  onOpenAdvertizerDashboard,
  onOpenAdminDashboard,
  onOpenNotifications,
  onOpenSubmitAd,
  unreadNotificationsCount = 0,
}) => {
  const role = user?.role || 'USER';
  const isAdvertizer = role === 'ADVERTIZER';
  const isAdmin = role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Wordmark & Role Indicator */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('NEARBY');
            }}
            className="flex items-center whitespace-nowrap"
            aria-label="Offema home"
          >
            <BrandLogo size={30} />
          </a>

          {/* Role Badge */}
          {user && (
            <button
              onClick={onOpenProfile}
              className={`hidden min-[400px]:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                  : isAdvertizer
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
              }`}
              title="Click to view profile & switch role"
            >
              {isAdmin ? (
                <Shield size={11} className="text-purple-600" />
              ) : isAdvertizer ? (
                <Megaphone size={11} className="text-amber-600" />
              ) : (
                <UserIcon size={11} className="text-indigo-600" />
              )}
              <span className="capitalize">{role.toLowerCase()}</span>
            </button>
          )}

          <button
            onClick={onOpenDemoInfo}
            className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 transition-colors px-2 py-0.5 rounded-md cursor-pointer border border-slate-200"
            title="View Demo Mode & Architecture details"
          >
            <Sparkles size={11} className="text-indigo-600" />
            <span>Demo Details</span>
          </button>
        </div>

        {/* Zone 2: Location Quick Target */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenLocationModal}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-full transition-colors max-w-[220px] truncate cursor-pointer"
            title="Change location setting"
          >
            <MapPin size={13} className="text-indigo-600 shrink-0" />
            <span className="truncate">{locationLabel || 'Detect location'}</span>
          </button>
        </div>

        {/* Zone 3: Navigation, Advertizer Actions, & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Advertizer Specific Buttons */}
          {isAdvertizer && (
            <>
              {onOpenSubmitAd && (
                <button
                  onClick={onOpenSubmitAd}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-sm transition-all cursor-pointer"
                  title="Submit a new advertisement"
                >
                  <Plus size={13} />
                  <span>Submit Ad</span>
                </button>
              )}

              {onOpenAdvertizerDashboard && (
                <button
                  onClick={onOpenAdvertizerDashboard}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
                  title="Open Advertizer Campaign Dashboard"
                >
                  <Megaphone size={13} />
                  <span className="hidden md:inline">My Campaigns</span>
                </button>
              )}

              {onOpenNotifications && (
                <button
                  onClick={onOpenNotifications}
                  className="relative p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="View notifications"
                >
                  <Bell size={16} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
              )}
            </>
          )}

          {/* Admin Specific Dashboard Button */}
          {isAdmin && onOpenAdminDashboard && (
            <button
              onClick={onOpenAdminDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors cursor-pointer"
              title="Open Admin Dashboard"
            >
              <Shield size={13} className="text-indigo-400" />
              <span>Admin Panel</span>
            </button>
          )}


          {/* Profile / Account Toggle */}
          {user && onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-indigo-500/25 ring-2 ring-white hover:scale-105 transition-transform cursor-pointer"
              title="Open Account Profile & Role Switcher"
            >
              {(user.displayName?.trim().charAt(0) || user.phoneNumber.slice(-2)).toUpperCase()}
            </button>
          )}

          {/* Logout */}
          {user && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
