import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { BookOpen, Users, Star, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import OpenShelfLoader from '../components/common/OpenShelfLoader';
import OpenShelfBrand from '../components/common/OpenShelfBrand';
import publicService from '../services/publicService';

const BASE = import.meta.env.BASE_URL || '/';

export default function AuthLayout() {
  const { isAuthenticated, user, loading, initialCheckDone } = useAuth();
  const { redirectByRole } = useAuthRedirect();

  // Real stats from backend
  const [stats, setStats] = useState({ books: 303, libraries: 8 });
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    if (initialCheckDone && isAuthenticated && user) {
      redirectByRole(user);
    }
  }, [initialCheckDone, isAuthenticated, user, redirectByRole]);

  // Fetch real public stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [libRes, bookRes] = await Promise.allSettled([
          publicService.getLibraries({ per_page: 1 }),
          publicService.getBooks({ per_page: 1 }),
        ]);
        const libTotal = libRes.status === 'fulfilled' ? (libRes.value?.meta?.total ?? 0) : 0;
        const bookTotal = bookRes.status === 'fulfilled' ? (bookRes.value?.meta?.total ?? 0) : 0;
        setStats({
          libraries: libTotal || 8,
          books: bookTotal || 303,
        });
        setStatsLoaded(true);
      } catch {
        setStatsLoaded(true);
      }
    };
    fetchStats();
  }, []);

  const fmt = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+`;
    return `${n}+`;
  };

  if (loading || !initialCheckDone) {
    return (
      <div className="min-h-screen bg-[#07172B] flex items-center justify-center">
        <OpenShelfLoader message="Checking your session..." />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null;
  }

  const features = [
    { icon: BookOpen, label: 'Access', sub: 'More Books' },
    { icon: Users, label: 'Stronger', sub: 'Communities' },
    { icon: Star, label: 'Brighter', sub: 'Opportunities' },
  ];

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#07172B] text-white flex flex-col lg:flex-row overflow-x-hidden overflow-y-auto lg:overflow-hidden font-sans select-none relative">

      {/* ═══════════════════════════════════════════════════════
          BASE LAYER: SHARP BACKGROUND PHOTO (Centered Mug & Books)
          ═══════════════════════════════════════════════════════ */}
      <div className="hidden lg:block absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[0.92]"
          style={{ backgroundImage: `url('${BASE}img/library-login.png')` }}
        />

        {/* Right side darkening gradient for high contrast behind the form card */}
        <div className="absolute inset-y-0 right-0 w-[55%] bg-gradient-to-l from-[#06121E] via-[#06121E]/85 to-transparent" />
      </div>

      {/* ═══════════════════════════════════════════════════════
          SVG OVERLAY: SOLID NAVY LEFT PANEL WITH GLOWING GOLD ARC
          ═══════════════════════════════════════════════════════ */}
      <svg
        className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-[5]"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldCurveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5B82E" stopOpacity="0.4" />
            <stop offset="15%" stopColor="#F5B82E" stopOpacity="1" />
            <stop offset="40%" stopColor="#FFDE6A" stopOpacity="1" />
            <stop offset="70%" stopColor="#F5B82E" stopOpacity="1" />
            <stop offset="100%" stopColor="#D99B16" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Solid Dark Navy Left Background */}
        <path
          d="M 0 0 L 370 0 C 425 280, 335 660, 420 1000 L 0 1000 Z"
          fill="#07172B"
        />

        {/* Soft Golden Outer Glow */}
        <path
          d="M 370 0 C 425 280, 335 660, 420 1000"
          stroke="#F5B82E"
          strokeWidth="6"
          fill="none"
          opacity="0.3"
          style={{ filter: 'blur(3px)' }}
        />

        {/* Crisp Golden Boundary Arc */}
        <path
          d="M 370 0 C 425 280, 335 660, 420 1000"
          stroke="url(#goldCurveGrad)"
          strokeWidth="2.2"
          fill="none"
        />
      </svg>

      {/* ═══════════════════════════════════════════════════════
          LEFT HERO CONTENT (Desktop only, positioned in navy zone)
          ═══════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex relative w-[37%] max-w-[540px] h-full z-10 flex-col justify-between p-8 xl:p-12 shrink-0">
        {/* Logo */}
        <header className="shrink-0">
          <OpenShelfBrand role="member" size="sm" dark />
        </header>

        {/* Hero Body */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-6 my-auto max-w-[440px]"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 text-amber-400 text-[10px] font-extrabold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>MORE BOOKS, BRIGHTER COMMUNITIES</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl xl:text-[2.85rem] font-black text-white leading-[1.08] tracking-tight">
            Your gateway to<br />
            <span className="text-[#F5B82E] block mt-1">
              endless knowledge
            </span>
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-sm leading-relaxed font-medium">
            Discover, borrow, and explore books across a network of community libraries. Your next great read is just a click away.
          </p>

          {/* Feature circles */}
          <div className="flex items-center gap-5 pt-1">
            {features.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,184,46,0.15)]">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <div className="leading-tight">
                  <span className="text-[13px] font-bold text-white block">{label}</span>
                  <span className="text-[10px] font-medium text-slate-400">{sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Community status pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#05111E]/90 border border-slate-700/70 rounded-full backdrop-blur-md shadow-lg w-fit">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-xs font-semibold text-slate-200">
              Connecting readers across Cambodia.
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-4 border-t border-slate-800/80">
            <div>
              <span className="text-3xl font-black text-white block leading-none">
                {statsLoaded ? fmt(stats.books) : '303+'}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F5B82E] mt-1.5 block">
                BOOKS AVAILABLE
              </span>
            </div>
            <div className="w-px h-8 bg-slate-700/80" />
            <div>
              <span className="text-3xl font-black text-white block leading-none">
                {statsLoaded ? fmt(stats.libraries) : '8+'}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F5B82E] mt-1.5 block">
                LIBRARIES
              </span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="shrink-0 pt-4">
          <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5 text-[#F5B82E]" />
            <span>EMPOWERING COMMUNITIES</span>
          </div>
        </footer>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RIGHT AUTH FORM CONTAINER (Responsive on all screen sizes)
          ═══════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[48%] min-h-screen lg:min-h-0 lg:h-full flex flex-col justify-between items-center px-4 py-3 sm:px-6 sm:py-4 lg:px-6 lg:py-3 xl:px-8 relative z-10 ml-auto select-none overflow-y-auto lg:overflow-hidden">
        {/* Top Header Slogan (Desktop) */}
        <div className="w-full max-w-[420px] hidden lg:flex items-center justify-end gap-3 text-[11px] font-medium text-slate-400 tracking-wider shrink-0 pt-0.5">
          <span>Books</span>
          <span className="text-slate-600">•</span>
          <span>People</span>
          <span className="text-slate-600">•</span>
          <span>Possibilities</span>
        </div>

        {/* Center Card Container */}
        <div className="w-full max-w-[420px] relative z-10 my-auto py-1 sm:py-2">
          <React.Suspense fallback={<div className="flex-1 flex items-center justify-center p-8"><div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <Outlet />
          </React.Suspense>
        </div>

        {/* Bottom copyright / network footer on desktop */}
        <div className="w-full max-w-[420px] hidden lg:flex items-center justify-center text-[10px] text-slate-500 font-medium tracking-wide shrink-0 pb-1">
          <span>OpenShelf Library Network © 2026</span>
        </div>
      </div>
    </div>
  );
}