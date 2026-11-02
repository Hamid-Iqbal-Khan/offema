/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthUser } from '../domain/models/Offer';
import {
  LogOut,
  MapPin,
  Sparkles,
  User as UserIcon,
  Megaphone,
  Shield,
  Bell,
  Plus,
  Usb,
  Smartphone,
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
  onOpenInstallModal?: () => void;
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
  onOpenInstallModal,
  unreadNotificationsCount = 0,
}) => {
  const role = user?.role || 'USER';
  const isAdvertizer = role === 'ADVERTIZER';
  const isAdmin = role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-3">
        {/* Zone 1: Wordmark & Role Indicator */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('NEARBY');
            }}
            className="flex items-center gap-1.5 text-base sm:text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap"
          >
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Offema</span>
          </a>

          {/* Role Badge */}
          {user && (
            <button
              onClick={onOpenProfile}
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
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
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenLocationModal}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors max-w-[140px] sm:max-w-[200px] truncate cursor-pointer"
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
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-all cursor-pointer"
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

          {/* Cross-Platform USB / Mobile Phone Install Button */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all cursor-pointer"
              title="Install on phone via USB cable (ADB), APK, or PWA"
            >
              <Usb size={13} className="text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Install on Phone</span>
              <span className="sm:hidden">Install</span>
            </button>
          )}

          {/* Profile / Account Toggle */}
          {user && onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              title="Open Account Profile & Role Switcher"
            >
              {user.phoneNumber.slice(-2)}
            </button>
          )}

          {/* Logout */}
          {user && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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
