import { QueryClient } from '@tanstack/react-query';

/**
 * OpenShelf Singleton QueryClient
 * Standardized conservative caching defaults for performance and background freshness.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutes default stale time
      gcTime: 1000 * 60 * 15,          // 15 minutes garbage collection time
      refetchOnWindowFocus: false,    // Prevent refetching on window tab switch
      retry: 1,                       // Retry failed requests once
    },
  },
});

export default queryClient;
