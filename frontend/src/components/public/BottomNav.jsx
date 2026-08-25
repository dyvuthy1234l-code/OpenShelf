import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Building2, Bell, User, LogIn } from "lucide-react";
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
    <nav className="block md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-stretch justify-around pb-4 pt-1">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 relative transition-colors ${
                active ? "text-amber-500" : "text-slate-400"
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-500 rounded-full" />
              )}
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold leading-none ${active ? "text-amber-500" : "text-slate-400"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
