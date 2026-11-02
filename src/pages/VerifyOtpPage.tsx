/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, Info, Sparkles } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { IAuthService } from '../services/auth/AuthService';
import { AuthUser } from '../domain/models/Offer';

interface VerifyOtpPageProps {
  authService: IAuthService;
  phoneNumber: string;
  countryCode: string;
  sessionInfo?: string;
  onBackToLogin: () => void;
  onSuccess: (user: AuthUser) => void;
  onOpenDemoInfo: () => void;
}

const RESEND_COOLDOWN_SECONDS = 30;

export const VerifyOtpPage: React.FC<VerifyOtpPageProps> = ({
  authService,
  phoneNumber,
  countryCode,
  sessionInfo,
  onBackToLogin,
  onSuccess,
  onOpenDemoInfo,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Masked phone number (e.g. +91 98765 •••••)
  const maskedPhone = `${countryCode} ${phoneNumber.slice(0, 5)} ${'•'.repeat(Math.max(4, phoneNumber.length - 5))}`;

  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric digit
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const updated = [...digits];
      updated[index] = '';
      setDigits(updated);
      return;
    }

    // Single digit input
    const char = cleaned.slice(-1);
    const updated = [...digits];
    updated[index] = char;
    setDigits(updated);

    // Auto-advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      const updated = [...digits];
      for (let i = 0; i < 6; i++) {
        updated[i] = pasteData[i] || '';
      }
      setDigits(updated);
      const nextIndex = Math.min(pasteData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleQuickFillDemo = () => {
    setDigits(['1', '2', '3', '4', '5', '6']);
    setError(null);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.verifyOtp(fullCode, sessionInfo);
      if (result.success && result.user) {
        onSuccess(result.user);
      } else {
        setError(result.error || 'Verification failed. Please check the code.');
      }
    } catch {
      setError('A network error occurred while verifying OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError(null);
    setCanResend(false);
    setCountdown(RESEND_COOLDOWN_SECONDS);

    try {
      const res = await authService.sendOtp(phoneNumber, countryCode);
      if (!res.success) {
        setError(res.error || 'Failed to resend OTP.');
      }
    } catch {
      setError('Failed to resend OTP due to network error.');
    }
  };

  return (
    <AuthLayout>
    <div className="lg:min-h-screen flex flex-col justify-between p-4 sm:p-6 antialiased">
      {/* Top Navigation */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <button
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Change Number</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDemoInfo}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer"
          >
            <Sparkles size={13} />
            <span className="hidden sm:inline">Demo Details</span>
          </button>
        </div>
      </div>

      {/* Main Verification Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl shadow-slate-200/70 space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-md shadow-indigo-600/20 mb-3">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Verify OTP
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              We sent a 6-digit code to <strong className="text-slate-900 font-semibold">{maskedPhone}</strong>
            </p>
          </div>

          {/* Demo OTP Notice with 1-Click Auto Fill */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-1.5 text-amber-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Info size={14} className="text-amber-700" />
                <span>Demo Code Available</span>
              </div>
              <button
                type="button"
                onClick={handleQuickFillDemo}
                className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
              >
                Auto-fill 123456
              </button>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              In demo mode, enter code <strong className="font-mono font-bold tracking-wider">123456</strong> or click Auto-fill above.
            </p>
          </div>

          {/* 6-Digit OTP Input Grid */}
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 sm:w-13 h-13 sm:h-14 text-center text-lg sm:text-xl font-bold bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all tabular-nums"
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || digits.join('').length !== 6}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Verify & Continue</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Resend Action */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Didn&apos;t receive code?</span>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
              >
                Resend OTP
              </button>
            ) : (
              <span className="font-medium text-slate-400 tabular-nums">
                Resend in {countdown}s
              </span>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 pb-2">
        Need assistance? Production instances route SMS through Firebase Auth Gateway.
      </footer>
    </div>
    </AuthLayout>
  );
};
