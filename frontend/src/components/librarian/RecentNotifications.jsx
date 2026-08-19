import { Bell, CheckCircle2 } from 'lucide-react';
import { formatNotificationTime } from '../../utils/dateUtils';

export default function RecentNotifications({ notifications = [] }) {
  if (notifications.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-extrabold text-slate-900">Recent Notifications</h4>
          </div>
        </div>

        <div className="py-4 text-center text-slate-400 text-xs italic flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>You're all caught up. No new notifications.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600" />
          <h4 className="text-sm font-extrabold text-slate-900">Recent Notifications</h4>
        </div>
        <span className="text-[10px] font-bold text-slate-400">Latest</span>
      </div>

      <div className="space-y-3 divide-y divide-slate-100 text-xs">
        {notifications.slice(0, 4).map((notif) => {
          let data = {};
          try {
            data = typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data || {};
          } catch {
            data = {};
          }

          return (
            <div key={notif.id} className="pt-3 first:pt-0 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">{data.title || 'System Alert'}</span>
                <span className="text-[10px] text-slate-400">
                  {formatNotificationTime(notif.created_at)}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-snug">{data.message || 'Notification detail'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
