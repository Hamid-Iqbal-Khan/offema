/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DemoAuthService } from '../services/auth/DemoAuthService';

describe('Role-Based Authentication & Access Management', () => {
  let authService: DemoAuthService;

  beforeEach(() => {
    authService = new DemoAuthService();
  });

  it('authenticates consumer user with USER role when requested', async () => {
    const sendRes = await authService.sendOtp('9876543210', '+91', 'USER');
    expect(sendRes.success).toBe(true);

    const verifyRes = await authService.verifyOtp('123456');
    expect(verifyRes.success).toBe(true);
    expect(verifyRes.user).toBeDefined();
    expect(verifyRes.user?.role).toBe('USER');
    expect(verifyRes.user?.phoneNumber).toBe('9876543210');
  });

  it('authenticates merchant user with ADVERTIZER role when requested', async () => {
    const sendRes = await authService.sendOtp('9811122233', '+91', 'ADVERTIZER');
    expect(sendRes.success).toBe(true);

    const verifyRes = await authService.verifyOtp('123456');
    expect(verifyRes.success).toBe(true);
    expect(verifyRes.user?.role).toBe('ADVERTIZER');
    expect(verifyRes.user?.advertizerProfile).toBeDefined();
  });

  it('authenticates authorized Admin against trusted backend registry regardless of requested role', async () => {
    // Admin logs in through standard screen without an admin option
    const sendRes = await authService.sendOtp('9999999999', '+91', 'USER');
    expect(sendRes.success).toBe(true);

    const verifyRes = await authService.verifyOtp('123456');
    expect(verifyRes.success).toBe(true);
    // Backend registry detects 9999999999 as trusted admin
    expect(verifyRes.user?.role).toBe('ADMIN');
    expect(verifyRes.user?.displayName).toBe('Authorized Admin');
  });

  it('allows seamless switching between USER and ADVERTIZER without account loss', async () => {
    await authService.sendOtp('9876543210', '+91', 'USER');
    await authService.verifyOtp('123456');

    expect(authService.getCurrentUser()?.role).toBe('USER');

    // Switch to Advertizer
    const switchedToAdvertizer = await authService.switchRole('ADVERTIZER');
    expect(switchedToAdvertizer.role).toBe('ADVERTIZER');
    expect(authService.getCurrentUser()?.role).toBe('ADVERTIZER');
    expect(authService.getCurrentUser()?.phoneNumber).toBe('9876543210');

    // Switch back to User
    const switchedToUser = await authService.switchRole('USER');
    expect(switchedToUser.role).toBe('USER');
    expect(authService.getCurrentUser()?.role).toBe('USER');
  });

  it('prevents role switching to ADMIN role', async () => {
    await authService.sendOtp('9876543210', '+91', 'USER');
    await authService.verifyOtp('123456');

    // Attempting unauthorized escalation to ADMIN must fail
    // @ts-expect-error Testing invalid runtime targetRole
    await expect(authService.switchRole('ADMIN')).rejects.toThrow(
      'Unauthorized role switch attempt'
    );
  });
});
