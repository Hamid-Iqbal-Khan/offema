/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthUser, UserRole } from '../../domain/models/Offer';
import { IAuthService, OtpSendResult, OtpVerifyResult } from './AuthService';
import { loginActivityService } from './LoginActivityService';
import { userService } from '../users/UserService';

const SESSION_STORAGE_KEY = 'nearby_offers_demo_user';
const DEMO_FIXED_OTP = '123456';

/**
 * Trusted backend registry of phone numbers with Admin authorization.
 * In production, this maps to a trusted Firebase Custom Claims / Admin collection.
 * Admin privileges are NEVER granted based on client-side requests or dropdowns.
 */
export const TRUSTED_ADMIN_CREDENTIALS = new Set(['9999999999', '8888888888']);

export class DemoAuthService implements IAuthService {
  public readonly isDemoMode = true;
  private currentUser: AuthUser | null = null;
  private listeners: Array<(user: AuthUser | null) => void> = [];
  private pendingPhone: { number: string; countryCode: string } | null = null;
  private pendingRole: 'USER' | 'ADVERTIZER' = 'USER';

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AuthUser;
          if (parsed) {
            if (!parsed.role) {
              parsed.role = TRUSTED_ADMIN_CREDENTIALS.has(parsed.phoneNumber) ? 'ADMIN' : 'USER';
            }
            this.currentUser = parsed;
          }
        }
      }
    } catch {
      this.currentUser = null;
    }
  }

  private persistSession(user: AuthUser | null): void {
    this.currentUser = user;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        if (user) {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
        } else {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch {
      // Storage unavailable or disabled
    }
    this.notifyListeners();
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.currentUser);
    }
  }

  async sendOtp(
    phoneNumber: string,
    countryCode: string,
    requestedRole: 'USER' | 'ADVERTIZER' = 'USER'
  ): Promise<OtpSendResult> {
    // Artificial latency for realism
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Validate phone number digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 8 || cleaned.length > 15) {
      return {
        success: false,
        error: 'Please enter a valid mobile number (10 digits).',
      };
    }

    this.pendingPhone = { number: cleaned, countryCode };
    this.pendingRole = requestedRole === 'ADVERTIZER' ? 'ADVERTIZER' : 'USER';

    return {
      success: true,
      sessionInfo: `demo_session_${Date.now()}`,
      demoCode: DEMO_FIXED_OTP,
    };
  }

  async verifyOtp(code: string, _sessionInfo?: string): Promise<OtpVerifyResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const cleanedCode = code.replace(/\D/g, '');
    const phone = this.pendingPhone?.number || '9876543210';

    if (cleanedCode.length !== 6) {
      const err = 'Please enter a 6-digit OTP code.';
      loginActivityService.recordFailedLogin(phone, err);
      return {
        success: false,
        error: err,
      };
    }

    // In demo mode, accept 123456
    if (cleanedCode !== DEMO_FIXED_OTP) {
      const err = `Incorrect verification code. For this preview, use demo code: ${DEMO_FIXED_OTP}`;
      loginActivityService.recordFailedLogin(phone, err);
      return {
        success: false,
        error: err,
      };
    }

    const countryCode = this.pendingPhone?.countryCode || '+91';

    // Verify Admin against trusted identity registry on backend
    const isAdmin = TRUSTED_ADMIN_CREDENTIALS.has(phone);

    let assignedRole: UserRole = 'USER';
    let displayName = `User (${phone.slice(-4)})`;

    if (isAdmin) {
      // Identity verified as authorized administrator in trusted registry
      assignedRole = 'ADMIN';
      displayName = 'Authorized Admin';
    } else if (this.pendingRole === 'ADVERTIZER') {
      assignedRole = 'ADVERTIZER';
      displayName = `Advertizer (${phone.slice(-4)})`;
    }

    const userId = isAdmin ? 'admin_trusted_root' : `demo_user_${phone.slice(-4)}`;

    // Ensure user exists in userService registry
    const existingUserProfile = await userService.getUserById(userId);
    if (!existingUserProfile) {
      try {
        await userService.createUser({
          phoneNumber: phone,
          countryCode,
          displayName,
          role: assignedRole,
          email: `${phone.slice(-4)}@offema.com`,
        });
      } catch {
        // Ignore if already created or phone exists
      }
    }

    const user: AuthUser = {
      uid: userId,
      phoneNumber: phone,
      countryCode,
      displayName,
      createdAt: existingUserProfile?.createdAt || new Date().toISOString(),
      isDemoUser: true,
      role: assignedRole,
      advertizerProfile:
        assignedRole === 'ADVERTIZER'
          ? {
              businessName: 'Metro Deals & Retail Group',
              contactPhone: `${countryCode} ${phone}`,
            }
          : undefined,
    };

    // Record login activity in analytics and user service
    loginActivityService.recordSuccessfulLogin(user);
    await userService.recordUserLogin(user.uid);

    this.persistSession(user);

    return {
      success: true,
      user,
    };
  }

  /**
   * Seamless role switching between User and Advertizer from the profile dashboard.
   * Preserves all user data, saved offers, and submitted campaigns.
   * Admin role cannot be assumed via role switching.
   */
  async switchRole(targetRole: 'USER' | 'ADVERTIZER'): Promise<AuthUser> {
    if (!this.currentUser) {
      throw new Error('User must be logged in to switch roles');
    }

    if (targetRole !== 'USER' && targetRole !== 'ADVERTIZER') {
      throw new Error('Unauthorized role switch attempt. Only User and Advertizer roles are allowed.');
    }

    // Update the role while preserving all existing user properties and data
    const updatedUser: AuthUser = {
      ...this.currentUser,
      role: targetRole,
      displayName:
        targetRole === 'ADVERTIZER'
          ? `Advertizer (${this.currentUser.phoneNumber.slice(-4)})`
          : `User (${this.currentUser.phoneNumber.slice(-4)})`,
      advertizerProfile:
        targetRole === 'ADVERTIZER'
          ? this.currentUser.advertizerProfile || {
              businessName: 'Merchant Retailer',
              contactPhone: `${this.currentUser.countryCode} ${this.currentUser.phoneNumber}`,
            }
          : this.currentUser.advertizerProfile,
    };

    this.persistSession(updatedUser);
    return updatedUser;
  }

  async logout(): Promise<void> {
    this.pendingPhone = null;
    this.persistSession(null);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }
}

export const demoAuthService = new DemoAuthService();
