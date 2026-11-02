/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Compass,
  Megaphone,
  ArrowRightLeft,
  Calendar,
  LogOut,
  CheckCircle,
  AlertCircle,
  Store,
  Usb,
} from 'lucide-react';
import { AuthUser, UserRole } from '../domain/models/Offer';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onSwitchRole: (newRole: 'USER' | 'ADVERTIZER') => Promise<void>;
  onLogout: () => void;
  onOpenInstallModal?: () => void;
  totalSubmissionsCount?: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSwitchRole,
  onLogout,
  onOpenInstallModal,
  totalSubmissionsCount = 0,
}) => {
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const role = user?.role || 'USER';
  const isCurrentlyAdvertizer = role === 'ADVERTIZER';
  const isCurrentlyAdmin = role === 'ADMIN';

  const handleRoleToggle = async () => {
    if (isCurrentlyAdmin) return;
    setError(null);
    setIsSwitching(true);
    try {
      const targetRole: UserRole = isCurrentlyAdvertizer ? 'USER' : 'ADVERTIZER';
      await onSwitchRole(targetRole);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to switch role');
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Account & Profile</h2>
              <p className="text-xs text-slate-500">Manage your active role and preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* User Identity Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mobile Number
                </span>
                <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                  {user.countryCode} {user.phoneNumber}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : role === 'ADVERTIZER'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                }`}
              >
                {role}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </span>
              {role === 'ADVERTIZER' && (
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Store size={13} className="text-amber-600" />
                  <span>{totalSubmissionsCount} Ad Submissions</span>
                </span>
              )}
            </div>
          </div>

          {/* Role Switching Section */}
          {!isCurrentlyAdmin ? (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ArrowRightLeft size={14} className="text-indigo-600" />
                  <span>Seamless Role Switching</span>
                </span>
                <span className="text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                  Active: {isCurrentlyAdvertizer ? 'Advertizer' : 'User'}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {isCurrentlyAdvertizer
                  ? 'Switch back to User mode anytime to browse nearby & global offers as a consumer without losing any submitted advertisements or campaign data.'
                  : 'Switch to Advertizer mode to submit discount campaigns, manage shop offers, track admin approval statuses, and receive real-time notifications.'}
              </p>

              <button
                type="button"
                onClick={handleRoleToggle}
                disabled={isSwitching}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSwitching ? (
                  <span>Updating Role...</span>
                ) : (
                  <>
                    {isCurrentlyAdvertizer ? (
                      <>
                        <Compass size={15} />
                        <span>Switch to User (Consumer) Mode</span>
                      </>
                    ) : (
                      <>
                        <Megaphone size={15} />
                        <span>Switch to Advertizer (Merchant) Mode</span>
                      </>
                    )}
                  </>
                )}
              </button>

              <div className="flex items-start gap-1.5 text-[10px] text-indigo-900/80 pt-1">
                <CheckCircle size={13} className="shrink-0 text-indigo-600 mt-0.5" />
                <span>
                  All your data, favorites, and campaign history are permanently preserved. Role switching never grants administrative privileges.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Shield size={14} className="text-purple-700" />
                <span>Authorized Administrative Account</span>
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                You have elevated permissions verified against the backend trusted identity registry. You have full oversight over all advertisements, categories, and review decisions.
              </p>
            </div>
          )}

          {/* Mobile Phone USB Install Option */}
          {onOpenInstallModal && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Usb size={16} className="text-emerald-700" />
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    Install on Phone via USB / APK
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Sideload over USB-C cable (ADB) or download universal APK
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInstallModal();
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Install
              </button>
            </div>
          )}

          {/* Sign Out Action */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">End current session</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-bold text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
