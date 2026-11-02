/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme?: string;
    cleartext?: boolean;
    url?: string;
  };
  android?: Record<string, unknown>;
  ios?: Record<string, unknown>;
  plugins?: Record<string, unknown>;
}

const config: CapacitorConfig = {
  appId: 'com.offema.app',
  appName: 'Offema',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      releaseType: 'APK',
    },
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    contentInset: 'always',
    scheme: 'Offema',
  },
  plugins: {
    Geolocation: {
      requestPermissionOnLoad: false,
    },
    Camera: {
      presentationStyle: 'popover',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
