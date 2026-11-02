/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { getTimeRemaining, TimeRemaining } from '../domain/logic/offerValidity';

/**
 * Custom React hook that provides a live 1-second ticking countdown timer
 * for an offer's expiration timestamp.
 */
export function useCountdown(validUntil: string): TimeRemaining {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    getTimeRemaining(validUntil)
  );

  useEffect(() => {
    // Sync immediately when target validUntil changes
    setTimeRemaining(getTimeRemaining(validUntil));

    const intervalId = setInterval(() => {
      setTimeRemaining(getTimeRemaining(validUntil));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [validUntil]);

  return timeRemaining;
}
