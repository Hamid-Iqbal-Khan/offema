/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LoginActivityRecord,
  LoginActivityMetrics,
  ClientPlatform,
  LoginTrendBucket,
} from '../../domain/models/LoginActivity';
import { AuthUser } from '../../domain/models/Offer';
import { userService } from '../users/UserService';

const LOGIN_ACTIVITY_STORAGE_KEY = 'nearby_offers_login_activities_v1';

// Seed realistic login activities spanning the last 7 days
function generateSeedActivities(): LoginActivityRecord[] {
  const records: LoginActivityRecord[] = [];
  const now = Date.now();
  const dayMs = 24 * 3600 * 1000;

  const sampleUsers = [
    { id: 'user_trusted_admin', role: 'ADMIN' as const, phone: '9999999999', platform: 'WEB' as const },
    { id: 'demo_user_2233', role: 'ADVERTIZER' as const, phone: '9811122233', platform: 'ANDROID' as const },
    { id: 'demo_user_3344', role: 'ADVERTIZER' as const, phone: '9822233344', platform: 'IOS' as const },
    { id: 'demo_user_4321', role: 'USER' as const, phone: '9876543210', platform: 'ANDROID' as const },
    { id: 'demo_user_5566', role: 'USER' as const, phone: '9833344455', platform: 'IOS' as const },
  ];

  // Past 7 days
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const dayTimestamp = now - dayOffset * dayMs;
    sampleUsers.forEach((u, idx) => {
      // Vary logins across days
      if ((dayOffset + idx) % 2 === 0 || dayOffset === 0) {
        records.push({
          id: `log-seed-${dayOffset}-${idx}`,
          userId: u.id,
          phoneNumber: u.phone,
          role: u.role,
          timestamp: new Date(dayTimestamp + idx * 3600 * 1000).toISOString(),
          status: 'SUCCESS',
          platform: u.platform,
          deviceInfo: u.platform === 'ANDROID' ? 'Pixel 8 (Android 14)' : u.platform === 'IOS' ? 'iPhone 15 Pro (iOS 17.5)' : 'Chrome on macOS',
        });
      }
    });

    // Add a failed attempt on a couple days
    if (dayOffset === 2 || dayOffset === 5) {
      records.push({
        id: `log-seed-fail-${dayOffset}`,
        phoneNumber: '9899999999',
        timestamp: new Date(dayTimestamp + 1800 * 1000).toISOString(),
        status: 'FAILED',
        failureReason: 'Invalid OTP verification code entered',
        platform: 'ANDROID',
        deviceInfo: 'Samsung Galaxy S24',
      });
    }
  }

  return records;
}

export class LoginActivityService {
  private records: LoginActivityRecord[] = [];
  private lastRecordedTimeByUser: Map<string, number> = new Map();

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(LOGIN_ACTIVITY_STORAGE_KEY);
        if (stored) {
          this.records = JSON.parse(stored);
        } else {
          this.records = generateSeedActivities();
          this.persist();
        }
      } else {
        this.records = generateSeedActivities();
      }
    } catch {
      this.records = generateSeedActivities();
    }
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(LOGIN_ACTIVITY_STORAGE_KEY, JSON.stringify(this.records));
      }
    } catch {
      // storage unavailable
    }
  }

  /**
   * Detect current client platform from navigator userAgent
   */
  public detectPlatform(): ClientPlatform {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return 'WEB';
    }
    const ua = navigator.userAgent || '';
    if (/android/i.test(ua)) return 'ANDROID';
    if (/iPad|iPhone|iPod/.test(ua)) return 'IOS';
    return 'WEB';
  }

  /**
   * Record a successful login event.
   * Debounces duplicate counting within 5 seconds for retries.
   */
  async recordSuccessfulLogin(
    user: AuthUser,
    platformOverride?: ClientPlatform,
    deviceInfo?: string
  ): Promise<LoginActivityRecord> {
    const now = Date.now();
    const lastTime = this.lastRecordedTimeByUser.get(user.uid);

    // Prevent duplicate activity count caused by rapid double-tap/refresh within 3 seconds
    if (lastTime && now - lastTime < 3000) {
      const existing = this.records[0];
      return existing;
    }

    this.lastRecordedTimeByUser.set(user.uid, now);

    const platform = platformOverride || this.detectPlatform();
    const cleanPhone = user.phoneNumber ? user.phoneNumber.replace(/\D/g, '') : undefined;

    const record: LoginActivityRecord = {
      id: `login-${now}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.uid,
      phoneNumber: cleanPhone,
      role: user.role,
      timestamp: new Date(now).toISOString(),
      status: 'SUCCESS',
      platform,
      deviceInfo: deviceInfo || (typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : 'Browser Client'),
    };

    this.records.unshift(record);
    this.persist();

    // Also update user's last login and login count in UserService
    await userService.recordUserLogin(user.uid);

    return record;
  }

  /**
   * Record a failed login attempt securely (no passwords or credentials stored).
   */
  async recordFailedLogin(
    identifier: string,
    failureReason: string,
    platformOverride?: ClientPlatform,
    deviceInfo?: string
  ): Promise<LoginActivityRecord> {
    const now = Date.now();
    const platform = platformOverride || this.detectPlatform();

    const record: LoginActivityRecord = {
      id: `login-fail-${now}-${Math.random().toString(36).substring(2, 6)}`,
      phoneNumber: identifier.includes('@') ? undefined : identifier.replace(/\D/g, ''),
      email: identifier.includes('@') ? identifier.toLowerCase() : undefined,
      timestamp: new Date(now).toISOString(),
      status: 'FAILED',
      failureReason,
      platform,
      deviceInfo: deviceInfo || (typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : 'Browser Client'),
    };

    this.records.unshift(record);
    this.persist();

    return record;
  }

  /**
   * Calculate login activity metrics: DAU, WAU, MAU, trends, platform distribution.
   */
  async getActivityMetrics(): Promise<LoginActivityMetrics> {
    const allUsers = await userService.listUsers({ limit: 1000 });
    const totalRegisteredUsers = allUsers.total;

    const now = Date.now();
    const oneDayAgo = now - 24 * 3600 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 3600 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 3600 * 1000;

    const successfulRecords = this.records.filter((r) => r.status === 'SUCCESS');
    const failedRecords = this.records.filter((r) => r.status === 'FAILED');

    // Distinct users today (DAU)
    const dauSet = new Set<string>();
    successfulRecords.forEach((r) => {
      const ts = new Date(r.timestamp).getTime();
      if (ts >= oneDayAgo && r.userId) {
        dauSet.add(r.userId);
      }
    });

    // Distinct users this week (WAU)
    const wauSet = new Set<string>();
    successfulRecords.forEach((r) => {
      const ts = new Date(r.timestamp).getTime();
      if (ts >= sevenDaysAgo && r.userId) {
        wauSet.add(r.userId);
      }
    });

    // Distinct users this month (MAU)
    const mauSet = new Set<string>();
    successfulRecords.forEach((r) => {
      const ts = new Date(r.timestamp).getTime();
      if (ts >= thirtyDaysAgo && r.userId) {
        mauSet.add(r.userId);
      }
    });

    // Platform breakdown
    const platformBreakdown = {
      android: successfulRecords.filter((r) => r.platform === 'ANDROID').length,
      ios: successfulRecords.filter((r) => r.platform === 'IOS').length,
      web: successfulRecords.filter((r) => r.platform === 'WEB').length,
    };

    // Build 7-day daily trends
    const trendsMap: Map<string, { successful: number; failed: number; users: Set<string> }> = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 3600 * 1000);
      const dateKey = d.toISOString().split('T')[0];
      trendsMap.set(dateKey, { successful: 0, failed: 0, users: new Set() });
    }

    this.records.forEach((r) => {
      const dateKey = r.timestamp.split('T')[0];
      const entry = trendsMap.get(dateKey);
      if (entry) {
        if (r.status === 'SUCCESS') {
          entry.successful++;
          if (r.userId) entry.users.add(r.userId);
        } else {
          entry.failed++;
        }
      }
    });

    const recentLoginTrends: LoginTrendBucket[] = [];
    trendsMap.forEach((val, date) => {
      recentLoginTrends.push({
        date,
        successfulLogins: val.successful,
        failedLogins: val.failed,
        uniqueUsers: val.users.size,
      });
    });

    const lastLoginTime = successfulRecords.length > 0 ? successfulRecords[0].timestamp : undefined;

    return {
      totalRegisteredUsers,
      activeUsersToday: dauSet.size,
      activeUsersThisWeek: wauSet.size,
      activeUsersThisMonth: mauSet.size,
      totalLoginsAllTime: successfulRecords.length,
      failedLoginAttemptsCount: failedRecords.length,
      platformBreakdown,
      recentLoginTrends,
      lastLoginTime,
    };
  }

  /**
   * Retrieve recent login activity logs
   */
  async getRecentActivityLogs(limit: number = 50): Promise<LoginActivityRecord[]> {
    return this.records.slice(0, limit);
  }
}

export const loginActivityService = new LoginActivityService();
