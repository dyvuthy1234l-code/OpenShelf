import { Link, useLocation } from 'react-router-dom';
import { Home, Book, Building2, Bookmark, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Books', path: '/books', icon: Book },
    { name: 'Libraries', path: '/libraries', icon: Building2 },
  ];

  if (isAuthenticated && user?.role === 'member') {
    navItems.push({ name: 'Favorites', path: '/member/favorites', icon: Bookmark });
    navItems.push({ name: 'Profile', path: '/member/profile', icon: User });
  } else if (!isAuthenticated) {
    navItems.push({ name: 'Sign In', path: '/login', icon: User });
  } else if (isAuthenticated && user?.role !== 'member') {
    navItems.push({ name: 'Profile', path: `/${user.role}/profile`, icon: User });
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#DCE6F0] z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-[#123A63]' : 'text-[#64748B] hover:text-[#102A43]'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-[#F5F8FC]' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'fill-[#123A63]/10' : ''}`} />
              </div>
              <span className={`text-[10px] ${isActive ? 'font-black' : 'font-semibold'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
