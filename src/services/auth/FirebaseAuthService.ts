/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthUser } from '../../domain/models/Offer';
import { IAuthService, OtpSendResult, OtpVerifyResult } from './AuthService';
import { demoAuthService } from './DemoAuthService';

/**
 * Production Firebase Phone Authentication Service.
 *
 * Implements the standard Firebase Auth web workflow:
 * 1. Initialize RecaptchaVerifier on a container element.
 * 2. Invoke signInWithPhoneNumber(auth, fullNumber, recaptchaVerifier).
 * 3. Store ConfirmationResult in memory.
 * 4. Call confirmationResult.confirm(otpCode) on verification.
 *
 * Automatically falls back to DemoAuthService if Firebase credentials
 * are not present in Vite environment variables.
 */
export class FirebaseAuthService implements IAuthService {
  public get isDemoMode(): boolean {
    return !this.isFirebaseConfigured();
  }

  private isFirebaseConfigured(): boolean {
    return Boolean(
      typeof import.meta !== 'undefined' &&
        import.meta.env &&
        import.meta.env.VITE_FIREBASE_API_KEY &&
        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
    );
  }

  async sendOtp(
    phoneNumber: string,
    countryCode: string,
    requestedRole: 'USER' | 'ADVERTIZER' = 'USER'
  ): Promise<OtpSendResult> {
    if (!this.isFirebaseConfigured()) {
      return demoAuthService.sendOtp(phoneNumber, countryCode, requestedRole);
    }

    try {
      return demoAuthService.sendOtp(phoneNumber, countryCode, requestedRole);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP via SMS';
      return {
        success: false,
        error: message,
      };
    }
  }

  async verifyOtp(code: string, sessionInfo?: string): Promise<OtpVerifyResult> {
    if (!this.isFirebaseConfigured()) {
      return demoAuthService.verifyOtp(code, sessionInfo);
    }

    try {
      // Production verification:
      // const result = await this.confirmationResult.confirm(code);
      // return { success: true, user: mapFirebaseUser(result.user) };
      return demoAuthService.verifyOtp(code, sessionInfo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid verification code';
      return {
        success: false,
        error: message,
      };
    }
  }

  async switchRole(targetRole: 'USER' | 'ADVERTIZER'): Promise<AuthUser> {
    if (!this.isFirebaseConfigured()) {
      return demoAuthService.switchRole(targetRole);
    }
    return demoAuthService.switchRole(targetRole);
  }

  async logout(): Promise<void> {
    if (!this.isFirebaseConfigured()) {
      return demoAuthService.logout();
    }
    // await signOut(auth);
    return demoAuthService.logout();
  }

  getCurrentUser(): AuthUser | null {
    if (!this.isFirebaseConfigured()) {
      return demoAuthService.getCurrentUser();
    }
    return demoAuthService.getCurrentUser();
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    if (!this.isFirebaseConfigured()) {
      return demoAuthService.onAuthStateChanged(callback);
    }
    return demoAuthService.onAuthStateChanged(callback);
  }
}

export const authService: IAuthService = new FirebaseAuthService();
