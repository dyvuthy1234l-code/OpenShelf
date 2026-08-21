import { useQuery, keepPreviousData } from '@tanstack/react-query';
import publicService from '../../services/publicService';

/**
 * Reusable query hook for libraries list & details.
 */
export function useLibraries(params = {}) {
  return useQuery({
    queryKey: ['libraries', params],
    queryFn: () => publicService.getLibraries(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData,
  });
}

export function useLibraryDetail(id) {
  return useQuery({
    queryKey: ['library', id],
    queryFn: () => publicService.getLibrary(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: Boolean(id),
  });
}
