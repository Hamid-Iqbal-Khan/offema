/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'USER' | 'ADVERTIZER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';

export interface UserProfile {
  id: string;
  phoneNumber: string;
  countryCode: string;
  email?: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  lastLoginAt?: string; // ISO-8601
  loginCount: number;
  vendorId?: string; // Associated vendor profile ID if role is ADVERTIZER
  metadata?: Record<string, unknown>;
}

export interface CreateUserPayload {
  phoneNumber: string;
  countryCode?: string;
  email?: string;
  displayName?: string;
  role?: UserRole;
  avatarUrl?: string;
}

export interface UpdateUserPayload {
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
  role?: UserRole;
  status?: UserStatus;
  avatarUrl?: string;
}

export interface UserFilterCriteria {
  search?: string;
  role?: UserRole | 'ALL';
  status?: UserStatus | 'ALL';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
