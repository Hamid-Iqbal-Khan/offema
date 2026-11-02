/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from '../services/users/UserService';
import { AuthUser } from '../domain/models/Offer';

// Polyfill localStorage in Node test runner
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: unknown }).localStorage = createMockLocalStorage();
}

describe('UserService - User Registration & Profile CRUD', () => {
  let service: UserService;

  const mockAdmin: AuthUser = {
    uid: 'admin_root',
    phoneNumber: '9999999999',
    countryCode: '+91',
    displayName: 'Authorized Admin',
    createdAt: new Date().toISOString(),
    isDemoUser: true,
    role: 'ADMIN',
  };

  const mockUser: AuthUser = {
    uid: 'user_regular_1',
    phoneNumber: '9888877777',
    countryCode: '+91',
    displayName: 'Regular Customer',
    createdAt: new Date().toISOString(),
    isDemoUser: true,
    role: 'USER',
  };

  beforeEach(() => {
    // Clear storage and create fresh service instance
    localStorage.clear();
    service = new UserService();
  });

  it('creates a new user with valid inputs', async () => {
    const newUser = await service.createUser({
      phoneNumber: '9123456789',
      countryCode: '+91',
      displayName: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      role: 'USER',
    });

    expect(newUser.id).toBeDefined();
    expect(newUser.phoneNumber).toBe('9123456789');
    expect(newUser.displayName).toBe('Aarav Patel');
    expect(newUser.email).toBe('aarav.patel@example.com');
    expect(newUser.role).toBe('USER');
    expect(newUser.status).toBe('ACTIVE');
  });

  it('prevents duplicate registration by phone number', async () => {
    await service.createUser({
      phoneNumber: '9123456789',
      countryCode: '+91',
      displayName: 'First User',
    });

    await expect(
      service.createUser({
        phoneNumber: '9123456789',
        countryCode: '+91',
        displayName: 'Duplicate User',
      })
    ).rejects.toThrow(/already exists/i);
  });

  it('prevents duplicate registration by email', async () => {
    await service.createUser({
      phoneNumber: '9123456781',
      countryCode: '+91',
      displayName: 'User One',
      email: 'unique@example.com',
    });

    await expect(
      service.createUser({
        phoneNumber: '9123456782',
        countryCode: '+91',
        displayName: 'User Two',
        email: 'unique@example.com',
      })
    ).rejects.toThrow(/already registered/i);
  });

  it('validates phone number digit length (8-15 digits)', async () => {
    await expect(
      service.createUser({
        phoneNumber: '1234',
        countryCode: '+91',
        displayName: 'Short Phone',
      })
    ).rejects.toThrow(/valid mobile number/i);
  });

  it('validates email format', async () => {
    await expect(
      service.createUser({
        phoneNumber: '9123456789',
        countryCode: '+91',
        displayName: 'Invalid Email User',
        email: 'invalid-email-no-at',
      })
    ).rejects.toThrow(/invalid email/i);
  });

  it('retrieves user by id, phone, and email', async () => {
    const created = await service.createUser({
      phoneNumber: '9988776655',
      countryCode: '+91',
      displayName: 'Searchable User',
      email: 'searchable@test.com',
    });

    const byId = await service.getUserById(created.id);
    expect(byId?.displayName).toBe('Searchable User');

    const byPhone = await service.getUserByPhone('9988776655');
    expect(byPhone?.id).toBe(created.id);

    const byEmail = await service.getUserByEmail('searchable@test.com');
    expect(byEmail?.id).toBe(created.id);
  });

  it('paginates and filters users', async () => {
    const list = await service.listUsers({ page: 1, limit: 3 });
    expect(list.items.length).toBeLessThanOrEqual(3);
    expect(list.total).toBeGreaterThan(0);
    expect(list.totalPages).toBeGreaterThanOrEqual(1);

    const adminsOnly = await service.listUsers({ role: 'ADMIN' });
    expect(adminsOnly.items.every((u) => u.role === 'ADMIN')).toBe(true);
  });

  it('updates user profile with authorization', async () => {
    const created = await service.createUser({
      phoneNumber: '9111222333',
      countryCode: '+91',
      displayName: 'Before Update',
    });

    const updated = await service.updateUser(
      created.id,
      { displayName: 'After Update', email: 'updated@example.com' },
      mockAdmin
    );

    expect(updated.displayName).toBe('After Update');
    expect(updated.email).toBe('updated@example.com');
  });

  it('deactivates and deletes user with proper RBAC', async () => {
    const created = await service.createUser({
      phoneNumber: '9555666777',
      countryCode: '+91',
      displayName: 'To Be Deactivated',
    });

    // Non-admin non-owner fails
    await expect(
      service.deactivateUser(created.id, mockUser)
    ).rejects.toThrow(/unauthorized/i);

    // Admin deactivates successfully
    const deactivated = await service.deactivateUser(created.id, mockAdmin);
    expect(deactivated.status).toBe('DEACTIVATED');

    // Admin permanently deletes
    const deleted = await service.deleteUser(created.id, mockAdmin);
    expect(deleted).toBe(true);

    const notFound = await service.getUserById(created.id);
    expect(notFound).toBeNull();
  });
});
