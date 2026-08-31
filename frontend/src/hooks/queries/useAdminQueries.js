import { useQuery, keepPreviousData } from '@tanstack/react-query';
import adminService from '../../services/adminService';

/**
 * Standardized caching parameters:
 * 2 minutes staleTime for real-time responsiveness with 0ms perceived switch time
 */
const DEFAULT_STALE_TIME = 1000 * 60 * 2; // 2 minutes

export function useAdminDashboard(params = {}, options = {}) {
  return useQuery({
    queryKey: ['admin', 'dashboard', params],
    queryFn: () => adminService.getDashboard(params),
    staleTime: 1000 * 5, // 5s fresh cache
    retry: 1,
    placeholderData: keepPreviousData,
    refetchInterval: options.refetchInterval ?? 30000, // 30s background poll
    ...options,
  });
}

export function useAdminLibraries(params = {}) {
  return useQuery({
    queryKey: ['admin', 'libraries', params],
    queryFn: () => adminService.getLibraries(params),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useAdminLibrary(id) {
  return useQuery({
    queryKey: ['admin', 'library', id],
    queryFn: () => adminService.getLibrary(id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useAdminLibrarians(params = {}) {
  return useQuery({
    queryKey: ['admin', 'librarians', params],
    queryFn: () => adminService.getLibrarians(params),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useAdminLibrarian(id) {
  return useQuery({
    queryKey: ['admin', 'librarian', id],
    queryFn: () => adminService.getLibrarian(id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useAdminMembers(params = {}) {
  return useQuery({
    queryKey: ['admin', 'members', params],
    queryFn: () => adminService.getMembers(params),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useAdminMember(id) {
  return useQuery({
    queryKey: ['admin', 'member', id],
    queryFn: () => adminService.getMember(id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useAdminSubscriptions(params = {}) {
  return useQuery({
    queryKey: ['admin', 'subscriptions', params],
    queryFn: () => adminService.getSubscriptions(params),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useAdminSubscription(id) {
  return useQuery({
    queryKey: ['admin', 'subscription', id],
    queryFn: () => adminService.getSubscription(id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useAdminPayments(params = {}) {
  return useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: () => adminService.getPayments(params),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useAdminPayment(id) {
  return useQuery({
    queryKey: ['admin', 'payment', id],
    queryFn: () => adminService.getPayment(id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: Boolean(id),
  });
}

export function useAdminPlans() {
  return useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => adminService.getPlans(),
    staleTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
  });
}
