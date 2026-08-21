import { useQuery, keepPreviousData } from '@tanstack/react-query';
import publicService from '../../services/publicService';

/**
 * Reusable query hook for books catalogue.
 * Preserves previous data during pagination & filter changes.
 */
export function useBooks(params = {}) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => publicService.getBooks(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData,
  });
}

export function useBookDetail(id) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => publicService.getBook(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: Boolean(id),
  });
}
