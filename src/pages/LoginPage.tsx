/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Info,
  Compass,
  Megaphone,
  CheckCircle2,
} from 'lucide-react';
import { IAuthService } from '../services/auth/AuthService';

interface LoginPageProps {
  authService: IAuthService;
  onOtpSent: (phone: string, countryCode: string, sessionInfo?: string) => void;
  onOpenDemoInfo: () => void;
  onOpenInstallModal?: () => void;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India (IN)', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
];

export const LoginPage: React.FC<LoginPageProps> = ({
  authService,
  onOtpSent,
  onOpenDemoInfo,
}) => {
  // Selected login persona: User or Advertizer (Admin is strictly NOT selectable)
  const [selectedRole, setSelectedRole] = useState<'USER' | 'ADVERTIZER'>('USER');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 8 || cleanNumber.length > 15) {
      setError('Please enter a valid mobile number (10 digits).');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.sendOtp(cleanNumber, countryCode, selectedRole);
      if (result.success) {
        onOtpSent(cleanNumber, countryCode, result.sessionInfo);
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setError('A network error occurred while contacting authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoUser = () => {
    setSelectedRole('USER');
    setCountryCode('+91');
    setPhoneNumber('9876543210');
    setError(null);
  };

  const handleFillDemoAdvertizer = () => {
    setSelectedRole('ADVERTIZER');
    setCountryCode('+91');
    setPhoneNumber('9811122233');
    setError(null);
  };

  const handleFillDemoAdmin = () => {
    // Admin credentials: Note that user selects either role in UI, but backend
    // strictly checks phone against trusted registry and upgrades to Admin!
    setCountryCode('+91');
    setPhoneNumber('9999999999');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 antialiased">
      {/* Top Banner Notice */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Offema
        </span>
        <button
          onClick={onOpenDemoInfo}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer"
        >
          <Sparkles size={13} />
          <span>Demo Details</span>
        </button>
      </div>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-md shadow-indigo-600/20 mb-3">
              <Phone size={22} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign in with Mobile
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Discover local discounts or submit business offers.
            </p>
          </div>

          {/* Role Selection (User vs Advertizer - Admin is strictly never a choice) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* User Option */}
              <button
                type="button"
                onClick={() => setSelectedRole('USER')}
                className={`relative flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'USER'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      selectedRole === 'USER'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Compass size={15} />
                  </div>
                  {selectedRole === 'USER' && (
                    <CheckCircle2 size={16} className="text-indigo-600" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-900">User</span>
                <span className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                  Browse nearby & global offers, view deals & bookmarks
                </span>
              </button>

              {/* Advertizer Option */}
              <button
                type="button"
                onClick={() => setSelectedRole('ADVERTIZER')}
                className={`relative flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'ADVERTIZER'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      selectedRole === 'ADVERTIZER'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Megaphone size={15} />
                  </div>
                  {selectedRole === 'ADVERTIZER' && (
                    <CheckCircle2 size={16} className="text-indigo-600" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-900">Advertizer</span>
                <span className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                  Submit discounts & sales, track status & notifications
                </span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * You can switch between User and Advertizer roles anytime from your profile without losing data.
            </p>
          </div>

          {/* Demo Credentials Quick Switcher */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 text-amber-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Info size={14} className="text-amber-700" />
                <span>Quick Test Accounts</span>
              </div>
              <span className="text-[10px] text-amber-700 font-medium">OTP: 123456</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={handleFillDemoUser}
                className="py-1 px-2 rounded-lg bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100 text-center transition-colors cursor-pointer"
              >
                User (Buyer)
              </button>
              <button
                type="button"
                onClick={handleFillDemoAdvertizer}
                className="py-1 px-2 rounded-lg bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100 text-center transition-colors cursor-pointer"
              >
                Advertizer
              </button>
              <button
                type="button"
                onClick={handleFillDemoAdmin}
                title="Authorized Admin: Verified via backend registry"
                className="py-1 px-2 rounded-lg bg-amber-200/70 border border-amber-400 font-bold text-amber-950 hover:bg-amber-200 text-center transition-colors cursor-pointer"
              >
                Admin (Auth)
              </button>
            </div>
            <p className="text-[10px] text-amber-800 leading-tight">
              Backend verifies Admin accounts against trusted registry; unauthorized accounts cannot access admin APIs.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="phone-input"
                className="block text-xs font-bold text-slate-900 uppercase tracking-wider"
              >
                Mobile Phone Number
              </label>

              <div className="flex items-center gap-2">
                {/* Country Code Select */}
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>

                {/* Mobile Input */}
                <div className="relative flex-1">
                  <input
                    id="phone-input"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium py-2.5 px-3.5 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors tabular-nums"
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span>Sending OTP...</span>
              ) : (
                <>
                  <span>Continue as {selectedRole === 'USER' ? 'User' : 'Advertizer'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Privacy Consent Notice */}
          <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
            <ShieldCheck size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <span>
              By signing in, your role permissions are enforced securely on the backend. No promotional spam will ever be sent.
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 pb-2">
        Offema (offema.com) · Role-Based Marketplace & Verified Merchant Feeds
      </footer>
    </div>
  );
};
