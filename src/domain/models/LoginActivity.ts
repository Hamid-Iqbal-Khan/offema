/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from './User';

export type ClientPlatform = 'ANDROID' | 'IOS' | 'WEB';

export interface LoginActivityRecord {
  id: string;
  userId?: string;
  phoneNumber?: string;
  email?: string;
  role?: UserRole;
  timestamp: string; // ISO-8601
  status: 'SUCCESS' | 'FAILED';
  failureReason?: string;
  platform: ClientPlatform;
  deviceInfo?: string;
  ipLocation?: string;
}

export interface LoginTrendBucket {
  date: string; // YYYY-MM-DD
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
}

export interface LoginActivityMetrics {
  totalRegisteredUsers: number;
  activeUsersToday: number; // DAU
  activeUsersThisWeek: number; // WAU
  activeUsersThisMonth: number; // MAU
  totalLoginsAllTime: number;
  failedLoginAttemptsCount: number;
  platformBreakdown: {
    android: number;
    ios: number;
    web: number;
  };
  recentLoginTrends: LoginTrendBucket[];
  lastLoginTime?: string;
}
