import { useQuery } from '@tanstack/react-query';
import memberService from '../../services/memberService';
import librarianService from '../../services/librarianService';
import adminService from '../../services/adminService';

/**
 * Reusable query hook for user notifications (role-specific).
 * Freshness requirement: 20 seconds.
 */
export function useNotifications(role = 'member', enabled = true) {
  return useQuery({
    queryKey: ['notifications', role],
    queryFn: async () => {
      if (role === 'admin') {
        return adminService.getNotifications();
      }
      if (role === 'librarian') {
        return librarianService.getNotifications();
      }
      return memberService.getNotifications();
    },
    staleTime: 1000 * 20, // 20 seconds
    enabled: enabled && Boolean(role),
  });
}
