/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base URL for backend API calls.
 * - Web (served from https://offema.com): empty → same-origin relative `/api/...` calls.
 * - Native APK (Capacitor): set VITE_API_BASE_URL=https://offema.com at build time so
 *   the bundled app talks to the hosted domain instead of the in-app WebView origin.
 */
const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');

export const apiUrl = (path: string): string =>
  `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
