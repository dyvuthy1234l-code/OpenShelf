import { useMutation, useQueryClient } from '@tanstack/react-query';
import memberService from '../../services/memberService';
import notificationService from '../../services/notificationService';

/**
 * Optimistic Mutation Hook: Mark single notification as read.
 * Optimistically updates cache & header bell count with snapshot rollback on error.
 */
export function useMarkNotificationAsRead(role = 'member') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (role === 'member') {
        return memberService.markNotificationAsRead(id);
      }
      return notificationService.markNotificationAsRead(id);
    },
    onMutate: async (id) => {
      // 1. Cancel active outgoing queries for this role
      await queryClient.cancelQueries({ queryKey: ['notifications', role] });

      // 2. Snapshot previous cache state
      const previousNotifications = queryClient.getQueryData(['notifications', role]);

      // 3. Optimistically update query cache
      if (previousNotifications) {
        queryClient.setQueryData(['notifications', role], (old) => {
          if (!old) return old;
          const list = Array.isArray(old.data) ? old.data : (Array.isArray(old) ? old : []);
          const updatedList = list.map((item) =>
            item.id === id ? { ...item, read_at: item.read_at || new Date().toISOString(), is_read: true } : item
          );
          const currentUnread = old.unread_count ?? list.filter(n => !n.read_at && !n.is_read).length;
          const newUnread = Math.max(0, currentUnread - 1);

          return {
            ...old,
            data: updatedList,
            unread_count: newUnread,
          };
        });
      }

      return { previousNotifications };
    },
    onError: (err, id, context) => {
      // Rollback to snapshot on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', role], context.previousNotifications);
      }
    },
    onSettled: () => {
      // Refetch to align with server
      queryClient.invalidateQueries({ queryKey: ['notifications', role] });
    },
  });
}

/**
 * Optimistic Mutation Hook: Mark all notifications as read.
 * Optimistically clears unread count & updates all items with snapshot rollback on error.
 */
export function useMarkAllNotificationsAsRead(role = 'member') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (role === 'member') {
        return memberService.markAllNotificationsAsRead();
      }
      return notificationService.markAllNotificationsAsRead();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications', role] });
      const previousNotifications = queryClient.getQueryData(['notifications', role]);

      if (previousNotifications) {
        queryClient.setQueryData(['notifications', role], (old) => {
          if (!old) return old;
          const list = Array.isArray(old.data) ? old.data : (Array.isArray(old) ? old : []);
          const updatedList = list.map((item) => ({
            ...item,
            read_at: item.read_at || new Date().toISOString(),
            is_read: true,
          }));

          return {
            ...old,
            data: updatedList,
            unread_count: 0,
          };
        });
      }

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', role], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', role] });
    },
  });
}
