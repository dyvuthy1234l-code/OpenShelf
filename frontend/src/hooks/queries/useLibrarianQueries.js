import { useQuery, keepPreviousData } from '@tanstack/react-query';
import librarianService from '../../services/librarianService';

/**
 * Standardized caching parameters:
 * 2 minutes staleTime for real-time responsiveness with 0ms perceived switch time
 */
const DEFAULT_STALE_TIME = 1000 * 60 * 2; // 2 minutes

export function useMyLibrary(options = {}) {
  return useQuery({
    queryKey: ['librarian', 'my-library'],
    queryFn: () => librarianService.getMyLibrary(),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useLibrarianReports(params = {}, options = {}) {
  return useQuery({
    queryKey: ['librarian', 'reports', params],
    queryFn: () => librarianService.getReports(params),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useLibrarianBooks(params = {}, options = {}) {
  return useQuery({
    queryKey: ['librarian', 'books', params],
    queryFn: () => librarianService.getBooks(params),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useLibrarianBook(id) {
  return useQuery({
    queryKey: ['librarian', 'book', id],
    queryFn: () => librarianService.getBook(id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useLibrarianBorrowRequests(params = {}, options = {}) {
  return useQuery({
    queryKey: ['librarian', 'borrow-requests', params],
    queryFn: () => librarianService.getBorrowings(params),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
    refetchInterval: options.refetchInterval ?? 30000, // 30s background poll for incoming requests
    ...options,
  });
}

export function useLibrarianReturns(params = {}, options = {}) {
  return useQuery({
    queryKey: ['librarian', 'returns', params],
    queryFn: () => librarianService.getBorrowings(params),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useLibrarianMembers(params = {}, options = {}) {
  return useQuery({
    queryKey: ['librarian', 'members', params],
    queryFn: () => librarianService.getMembers(params),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useLibrarianMember(id) {
  return useQuery({
    queryKey: ['librarian', 'member', id],
    queryFn: () => librarianService.getMember(id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useLibrarianCategories(params = {}, options = {}) {
  return useQuery({
    queryKey: ['librarian', 'categories', params],
    queryFn: () => librarianService.getCategories(params),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useLibrarianCategory(id) {
  return useQuery({
    queryKey: ['librarian', 'category', id],
    queryFn: () => librarianService.getCategory(id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: Boolean(id),
  });
}
