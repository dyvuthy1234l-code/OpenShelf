import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { BookOpen, Users, Star, Library } from 'lucide-react';
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
  const [stats, setStats] = useState({ books: 0, libraries: 0 });
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
        setStats({
          libraries: libRes.status === 'fulfilled' ? (libRes.value?.meta?.total ?? 0) : 0,
          books: bookRes.status === 'fulfilled' ? (bookRes.value?.meta?.total ?? 0) : 0,
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
      <div className="min-h-screen bg-[#061426] flex items-center justify-center">
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

  const statItems = [
    { value: stats.books, label: 'Books Available', icon: BookOpen },
    { value: stats.libraries, label: 'Libraries', icon: Library },
  ];

  return (
    <div className="h-screen w-full bg-[#061426] text-white flex overflow-hidden font-sans select-none">

      {/* ═══════════════════════════════════════════════════ */}
      {/* LEFT — HERO PANEL                                  */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] h-full relative overflow-hidden bg-[#07182B]">

        {/* ── Background Image (Full Width) ── */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url('${BASE}img/library-login.png')` }}
          />
        </div>

        {/* ── Premium Glassmorphism Wave Mask ── */}
        {/* Dark overlay that covers left side and softly fades into the wave */}
        <div className="absolute inset-0 z-[1] pointer-events-none flex">
          {/* Solid dark on the left half */}
          <div className="w-[50%] h-full bg-[#07182B]" />
          {/* Gradient transition area */}
          <div className="w-[30%] h-full bg-gradient-to-r from-[#07182B] via-[#07182B]/80 to-transparent" />
        </div>

        {/* ── The Sharp Elegant Wave ── */}
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          {/* Shifted left so we see more image on the right */}
          <svg
            className="absolute -left-10 top-0 bottom-0 h-full w-[110%] md:w-[90%] lg:w-[85%]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* The primary dark solid body creating the sharp cut */}
            <path
              d="M0,0 L65,0 C80,25 75,45 70,65 C65,85 75,95 70,100 L0,100 Z"
              fill="#061426"
            />
            
            {/* The single, sharp gold accent stroke following the edge */}
            <path
              d="M65,0 C80,25 75,45 70,65 C65,85 75,95 70,100"
              fill="none"
              stroke="url(#elegantGold)"
              strokeWidth="0.3"
              className="drop-shadow-[0_0_10px_rgba(245,184,46,0.5)]"
            />
            
            {/* Subtle inner glow for depth */}
            <path
              d="M64.7,0 C79.7,25 74.7,45 69.7,65 C64.7,85 74.7,95 69.7,100"
              fill="none"
              stroke="#07182B"
              strokeWidth="0.8"
            />

            <defs>
              <linearGradient id="elegantGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F5B82E" stopOpacity="0" />
                <stop offset="20%" stopColor="#F5B82E" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#FFF099" stopOpacity="1" />
                <stop offset="80%" stopColor="#F5B82E" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#F5B82E" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ── Ambient Vignettes ── */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#061426] to-transparent z-[3] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#061426]/90 to-transparent z-[3] pointer-events-none" />

        {/* ── Content layer ── */}
        <div className="relative z-10 flex flex-col justify-between p-8 xl:p-12 w-full h-full max-w-[65%]">

          {/* Logo (animated) */}
          <header className="shrink-0">
            <OpenShelfBrand role="member" size="sm" dark />
          </header>

          {/* Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-5 max-w-lg mt-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#F5B82E]/10 to-transparent border-l-2 border-[#F5B82E]"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#F5B82E]">
                More Books, Brighter Communities
              </span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-4xl xl:text-[2.75rem] font-black text-white leading-[1.1] tracking-tight">
              Your gateway to<br/>
              <span className="text-[#F5B82E] relative inline-block mt-1">
                endless knowledge
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'steps(2)' }}
                  className="absolute -right-3 bottom-1 w-1 h-[70%] bg-[#F5B82E]"
                />
              </span>
            </h1>

            {/* Description */}
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-[90%] font-medium">
              Discover, borrow, and explore books across a network of community libraries. Your next great read is just a click away.
            </p>

            {/* Feature circles */}
            <div className="flex items-start gap-6 pt-2">
              {features.map(({ icon: Icon, label, sub }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5B82E]/20 to-[#F5B82E]/5 border border-[#F5B82E]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,184,46,0.1)]">
                    <Icon className="w-4 h-4 text-[#F5B82E]" />
                  </div>
                  <div className="leading-tight">
                    <span className="text-[13px] font-bold text-white block">{label}</span>
                    <span className="text-[10px] font-medium text-[#94A3B8]">{sub}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Community status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#0B1A2D]/80 border border-[#203A59]/60 rounded-xl backdrop-blur-md shadow-lg mt-4"
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-semibold text-slate-300">
                Connecting readers across Cambodia.
              </span>
            </motion.div>

            {/* Stats — real from backend */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: statsLoaded ? 1 : 0.5 }}
              transition={{ delay: 0.5 }}
              className="flex items-center pt-6 mt-4 border-t border-[#203A59]/40"
            >
              {statItems.map(({ value, label }, i) => (
                <div key={label} className="flex items-center">
                  {i > 0 && <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#203A59] to-transparent mx-6" />}
                  <div>
                    <span className="text-2xl font-black text-white block leading-none tracking-tight">
                      {statsLoaded ? fmt(value) : '—'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5B82E] mt-1.5 block">{label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Footer */}
          <footer className="shrink-0 mb-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-widest">
              <BookOpen className="w-3 h-3 text-[#F5B82E]/40" />
              <span>Empowering communities</span>
            </div>
          </footer>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* RIGHT — AUTH FORM                                  */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[45%] h-full bg-[#061426] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <React.Suspense fallback={<div className="flex-1 flex items-center justify-center p-12"><div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <Outlet />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}
