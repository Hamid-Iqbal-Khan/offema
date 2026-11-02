/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  UserProfile,
  CreateUserPayload,
  UpdateUserPayload,
  UserFilterCriteria,
  PaginatedResult,
} from '../../domain/models/User';
import { AuthUser } from '../../domain/models/Offer';

const USERS_STORAGE_KEY = 'nearby_offers_users_registry_v1';

const SEED_USERS: UserProfile[] = [
  {
    id: 'user_trusted_admin',
    phoneNumber: '9999999999',
    countryCode: '+91',
    email: 'admin@offema.com',
    displayName: 'Authorized Admin',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-10-25T01:30:00.000Z',
    loginCount: 42,
  },
  {
    id: 'demo_user_2233',
    phoneNumber: '9811122233',
    countryCode: '+91',
    email: 'contact@wildyeastbakers.in',
    displayName: 'Advertizer (2233)',
    role: 'ADVERTIZER',
    status: 'ACTIVE',
    createdAt: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z',
    lastLoginAt: '2026-10-24T18:45:00.000Z',
    loginCount: 28,
    vendorId: 'vendor_wild_yeast',
  },
  {
    id: 'demo_user_3344',
    phoneNumber: '9822233344',
    countryCode: '+91',
    email: 'support@luxevision.com',
    displayName: 'Advertizer (3344)',
    role: 'ADVERTIZER',
    status: 'ACTIVE',
    createdAt: '2026-03-10T11:20:00.000Z',
    updatedAt: '2026-03-10T11:20:00.000Z',
    lastLoginAt: '2026-10-24T14:10:00.000Z',
    loginCount: 19,
    vendorId: 'vendor_luxe_vision',
  },
  {
    id: 'demo_user_4321',
    phoneNumber: '9876543210',
    countryCode: '+91',
    email: 'rahul.sharma@example.com',
    displayName: 'Rahul Sharma',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2026-04-05T08:15:00.000Z',
    updatedAt: '2026-04-05T08:15:00.000Z',
    lastLoginAt: '2026-10-25T02:00:00.000Z',
    loginCount: 35,
  },
  {
    id: 'demo_user_5566',
    phoneNumber: '9833344455',
    countryCode: '+91',
    email: 'priya.verma@example.com',
    displayName: 'Priya Verma',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2026-05-18T14:30:00.000Z',
    updatedAt: '2026-05-18T14:30:00.000Z',
    lastLoginAt: '2026-10-23T11:20:00.000Z',
    loginCount: 14,
  },
  {
    id: 'demo_user_inactive_77',
    phoneNumber: '9844455566',
    countryCode: '+91',
    email: 'former.shopper@example.com',
    displayName: 'Deactivated Shopper',
    role: 'USER',
    status: 'DEACTIVATED',
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-06-01T12:00:00.000Z',
    lastLoginAt: '2026-05-30T09:12:00.000Z',
    loginCount: 5,
  },
];

export class UserService {
  private users: UserProfile[] = [];

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        if (stored) {
          this.users = JSON.parse(stored);
        } else {
          this.users = [...SEED_USERS];
          this.persist();
        }
      } else {
        this.users = [...SEED_USERS];
      }
    } catch {
      this.users = [...SEED_USERS];
    }
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
      }
    } catch {
      // In-memory fallback
    }
  }

  /**
   * Normalize phone number to pure digits
   */
  public cleanPhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  /**
   * Validate email format
   */
  public isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  /**
   * Create a new user with validation and duplicate prevention.
   */
  async createUser(payload: CreateUserPayload): Promise<UserProfile> {
    const cleanedPhone = this.cleanPhone(payload.phoneNumber);
    if (!cleanedPhone || cleanedPhone.length < 8 || cleanedPhone.length > 15) {
      throw new Error('Invalid mobile number. Must contain 8 to 15 digits.');
    }

    // Check duplicate phone number
    const existingPhone = this.users.find((u) => u.phoneNumber === cleanedPhone);
    if (existingPhone) {
      throw new Error(`A user with phone number ${cleanedPhone} already exists.`);
    }

    // Validate and check duplicate email if provided
    let cleanEmail: string | undefined;
    if (payload.email?.trim()) {
      cleanEmail = payload.email.trim().toLowerCase();
      if (!this.isValidEmail(cleanEmail)) {
        throw new Error('Invalid email address format.');
      }
      const existingEmail = this.users.find((u) => u.email?.toLowerCase() === cleanEmail);
      if (existingEmail) {
        throw new Error(`A user with email "${cleanEmail}" is already registered.`);
      }
    }

    const nowIso = new Date().toISOString();
    const newUser: UserProfile = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      phoneNumber: cleanedPhone,
      countryCode: payload.countryCode || '+91',
      email: cleanEmail,
      displayName: payload.displayName?.trim() || `User (${cleanedPhone.slice(-4)})`,
      role: payload.role || 'USER',
      status: 'ACTIVE',
      avatarUrl: payload.avatarUrl,
      createdAt: nowIso,
      updatedAt: nowIso,
      loginCount: 0,
    };

    this.users.unshift(newUser);
    this.persist();
    return newUser;
  }

  /**
   * Retrieve a user by their unique ID
   */
  async getUserById(id: string): Promise<UserProfile | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  /**
   * Retrieve a user by their phone number
   */
  async getUserByPhone(phone: string): Promise<UserProfile | null> {
    const cleaned = this.cleanPhone(phone);
    const user = this.users.find((u) => u.phoneNumber === cleaned);
    return user ? { ...user } : null;
  }

  /**
   * Retrieve a user by their email
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.users.find((u) => u.email?.toLowerCase() === cleanEmail);
    return user ? { ...user } : null;
  }

  /**
   * List users with pagination, role filtering, status filtering, and search
   */
  async listUsers(criteria: UserFilterCriteria = {}): Promise<PaginatedResult<UserProfile>> {
    const page = Math.max(1, criteria.page || 1);
    const limit = Math.max(1, Math.min(100, criteria.limit || 10));

    let filtered = [...this.users];

    if (criteria.role && criteria.role !== 'ALL') {
      filtered = filtered.filter((u) => u.role === criteria.role);
    }

    if (criteria.status && criteria.status !== 'ALL') {
      filtered = filtered.filter((u) => u.status === criteria.status);
    }

    if (criteria.search?.trim()) {
      const q = criteria.search.trim().toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.phoneNumber.includes(q) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update user details with validation and authorization checks
   */
  async updateUser(
    userId: string,
    payload: UpdateUserPayload,
    actor?: AuthUser | UserProfile
  ): Promise<UserProfile> {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    const targetUser = this.users[index];

    // Authorization check: User can update themselves, or Admin can update anyone
    const actorId = actor ? ('uid' in actor ? actor.uid : actor.id) : undefined;
    if (actor && actor.role !== 'ADMIN' && actorId !== userId) {
      throw new Error('Unauthorized: You can only update your own profile.');
    }

    // Role change restriction: Only Admin can change roles
    if (payload.role && payload.role !== targetUser.role) {
      if (actor && actor.role !== 'ADMIN') {
        throw new Error('Unauthorized: Only administrators can modify user roles.');
      }
    }

    // Check duplicate phone if phone is being changed
    if (payload.phoneNumber) {
      const cleanedPhone = this.cleanPhone(payload.phoneNumber);
      if (cleanedPhone !== targetUser.phoneNumber) {
        const phoneClash = this.users.find(
          (u) => u.id !== userId && u.phoneNumber === cleanedPhone
        );
        if (phoneClash) {
          throw new Error(`Mobile number ${cleanedPhone} is already in use by another account.`);
        }
        targetUser.phoneNumber = cleanedPhone;
      }
    }

    // Check duplicate email if email is being changed
    if (payload.email !== undefined) {
      if (payload.email?.trim()) {
        const cleanEmail = payload.email.trim().toLowerCase();
        if (!this.isValidEmail(cleanEmail)) {
          throw new Error('Invalid email address format.');
        }
        if (cleanEmail !== targetUser.email?.toLowerCase()) {
          const emailClash = this.users.find(
            (u) => u.id !== userId && u.email?.toLowerCase() === cleanEmail
          );
          if (emailClash) {
            throw new Error(`Email "${cleanEmail}" is already in use by another account.`);
          }
          targetUser.email = cleanEmail;
        }
      } else {
        targetUser.email = undefined;
      }
    }

    if (payload.displayName?.trim()) {
      targetUser.displayName = payload.displayName.trim();
    }
    if (payload.countryCode) {
      targetUser.countryCode = payload.countryCode;
    }
    if (payload.role) {
      targetUser.role = payload.role;
    }
    if (payload.status) {
      targetUser.status = payload.status;
    }
    if (payload.avatarUrl !== undefined) {
      targetUser.avatarUrl = payload.avatarUrl;
    }

    targetUser.updatedAt = new Date().toISOString();
    this.users[index] = { ...targetUser };
    this.persist();

    return { ...targetUser };
  }

  /**
   * Deactivate a user profile according to business rules.
   */
  async deactivateUser(userId: string, actor?: AuthUser | UserProfile): Promise<UserProfile> {
    const actorId = actor ? ('uid' in actor ? actor.uid : actor.id) : undefined;
    if (actor && actor.role !== 'ADMIN' && actorId !== userId) {
      throw new Error('Unauthorized: You do not have permission to deactivate this user.');
    }

    return this.updateUser(userId, { status: 'DEACTIVATED' }, actor);
  }

  /**
   * Delete user profile (Admin only)
   */
  async deleteUser(userId: string, actor?: AuthUser | UserProfile): Promise<boolean> {
    if (actor && actor.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only administrators can permanently delete users.');
    }

    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    this.users.splice(index, 1);
    this.persist();
    return true;
  }

  /**
   * Record login event on user entity
   */
  async recordUserLogin(userId: string): Promise<void> {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.users[index].lastLoginAt = new Date().toISOString();
      this.users[index].loginCount = (this.users[index].loginCount || 0) + 1;
      this.persist();
    }
  }

  /**
   * Associate vendor ID with user
   */
  async setVendorId(userId: string, vendorId: string): Promise<void> {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.users[index].vendorId = vendorId;
      this.users[index].role = 'ADVERTIZER';
      this.persist();
    }
  }
}

export const userService = new UserService();
