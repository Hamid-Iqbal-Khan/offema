/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthUser } from '../../domain/models/Offer';

export interface OtpSendResult {
  success: boolean;
  sessionInfo?: string;
  demoCode?: string;
  error?: string;
}

export interface OtpVerifyResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface IAuthService {
  isDemoMode: boolean;
  sendOtp(phoneNumber: string, countryCode: string, requestedRole?: 'USER' | 'ADVERTIZER'): Promise<OtpSendResult>;
  verifyOtp(code: string, sessionInfo?: string): Promise<OtpVerifyResult>;
  switchRole(targetRole: 'USER' | 'ADVERTIZER'): Promise<AuthUser>;
  logout(): Promise<void>;
  getCurrentUser(): AuthUser | null;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
}
