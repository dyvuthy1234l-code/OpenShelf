import { useQuery } from '@tanstack/react-query';
import publicService from '../../services/publicService';

/**
 * Reusable query hook for book categories.
 */
export function useCategories(params = {}) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => publicService.getCategories(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
