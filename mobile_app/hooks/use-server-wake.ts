import { useEffect, useState } from 'react';

import { subscribeToSlowRequests } from '@/services/api';

/**
 * Returns `true` while at least one in-flight request has taken longer than
 * {@link import('@/services/api').SLOW_REQUEST_MS} — used to show the
 * "Waking up server..." banner during Render cold starts.
 */
export function useServerWake(): boolean {
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => subscribeToSlowRequests(setIsWaking), []);

  return isWaking;
}
