import { lazy } from 'react';

const RETRY_KEY = 'os:chunk-reloaded';

/**
 * lazy() wrapper that survives deploys: when a lazy chunk fails to load
 * (e.g. 404 after a new deployment invalidated old hashed files), reload
 * the page once to fetch the fresh bundle instead of showing a blank screen.
 */
export function lazyWithRetry(factory) {
  return lazy(() =>
    factory().catch((error) => {
      const isChunkError =
        error?.name === 'TypeError' ||
        /Loading chunk|dynamically imported module|Importing a module script failed|Failed to fetch/i.test(
          error?.message || ''
        );
      if (isChunkError && !sessionStorage.getItem(RETRY_KEY)) {
        sessionStorage.setItem(RETRY_KEY, '1');
        window.location.reload();
      }
      throw error;
    })
  );
}

export function clearChunkRetryFlag() {
  sessionStorage.removeItem(RETRY_KEY);
}
