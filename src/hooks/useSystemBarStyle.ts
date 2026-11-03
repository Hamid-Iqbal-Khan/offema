/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';

/**
 * Sets the colour of the phone's status-bar icons (clock, Wi-Fi, battery) for the
 * current screen in the native app: 'light-content' = white icons for dark/purple
 * headers, 'dark-content' = dark icons for white headers. No-op on the website.
 */
export function useSystemBarStyle(content: 'light-content' | 'dark-content') {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    SystemBars.setStyle({
      style: content === 'light-content' ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
    }).catch(() => {
      // Older native shells without the SystemBars plugin: keep the default
    });
  }, [content]);
}
