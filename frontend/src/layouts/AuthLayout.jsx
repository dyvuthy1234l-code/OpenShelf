import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import OpenShelfBrand from '../components/common/OpenShelfBrand';
import OpenShelfLoader from '../components/common/OpenShelfLoader';

export default function AuthLayout() {
  const { isAuthenticated, user, loading, initialCheckDone } = useAuth();
  const { redirectByRole } = useAuthRedirect();

  useEffect(() => {
    if (initialCheckDone && isAuthenticated && user) {
      redirectByRole(user);
    }
  }, [initialCheckDone, isAuthenticated, user, redirectByRole]);

  // Show nothing while checking auth
  if (loading || !initialCheckDone) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <OpenShelfLoader message="Checking your session..." />
      </div>
    );
  }

  // If authenticated, don't render - the useEffect will redirect
  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Left Panel — Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900" />
        
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -right-48 w-[30rem] h-[30rem] bg-amber-400/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-500/3 rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Logo */}
            <OpenShelfBrand role="member" size="md" dark className="mb-12" />

            {/* Tagline */}
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Your gateway to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                endless knowledge
              </span>
            </h2>

            <p className="text-navy-400 text-lg leading-relaxed max-w-md mb-12">
              Discover, borrow, and explore books across a network of community libraries. Your next great read is just a click away.
            </p>

            {/* Brand statement */}
            <div className="flex items-center gap-3 py-4 px-5 bg-navy-900/60 border border-navy-800/80 rounded-2xl max-w-md">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />
              <p className="text-xs text-navy-300 font-medium leading-relaxed">
                Connecting readers with community libraries across Cambodia.
              </p>
            </div>
          </motion.div>

          {/* Bottom decoration — floating book icons */}
          <div className="absolute bottom-8 left-12 xl:left-20 flex items-center gap-2 text-navy-700">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-medium tracking-wide">Empowering communities through shared reading</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo (shown only on small screens) */}
          <div className="lg:hidden mb-10 flex justify-center">
            <OpenShelfBrand role="member" size="sm" dark />
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
