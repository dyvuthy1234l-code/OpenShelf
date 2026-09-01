import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Building2, Bell, User, LogIn, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/queries/useNotifications";

export default function BottomNav() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isMember = isAuthenticated && user?.role === "member";

  const { data: notifData } = useNotifications("member", isMember);
  const unreadCount = notifData?.unread_count ?? 0;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const tabs = isMember
    ? [
        { icon: Home, label: "Home", path: "/" },
        { icon: BookOpen, label: "Books", path: "/books" },
        { icon: Building2, label: "Libraries", path: "/libraries" },
        { icon: Bell, label: "Alerts", path: "/member/notifications", badge: unreadCount },
        { icon: User, label: "Profile", path: "/member/profile" },
      ]
    : [
        { icon: Home, label: "Home", path: "/" },
        { icon: BookOpen, label: "Books", path: "/books" },
        { icon: Building2, label: "Libraries", path: "/libraries" },
        { icon: LogIn, label: "Login", path: "/login" },
      ];

  return (
    <nav
      aria-label="Member mobile navigation"
      className="block md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.5)] transition-colors duration-300"
    >
      <div className="flex h-[calc(4rem+env(safe-area-inset-bottom))] items-stretch justify-around px-2 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 flex-1 py-1 relative transition-all duration-200 cursor-pointer ${
                active
                  ? "text-amber-600 dark:text-amber-400 font-extrabold"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-amber-500 dark:bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,184,46,0.8)]" />
              )}
              <div className="relative mt-0.5">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? "scale-110 text-amber-500 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"
                  }`}
                  strokeWidth={active ? 2.4 : 1.9}
                />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-xs border-2 border-white dark:border-slate-900">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight leading-none ${active ? "font-black" : "font-semibold"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
