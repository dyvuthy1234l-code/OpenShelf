import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Building2, MapPin, BookOpen, ArrowRight, Sparkles, Star } from 'lucide-react';
import { getLibraryLogoUrl, getLibraryCoverUrl } from '../../utils/imageUrl';

export default function FeaturedLibraryCard({ library, rankIndex }) {
  const [coverErr, setCoverErr] = useState(false);
  const [logoErr, setLogoErr] = useState(false);

  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const logoUrl = getLibraryLogoUrl(library.image_url || library.image || library.logo, 160);
  const coverUrl = getLibraryCoverUrl(library.cover_image_url || library.cover_image, 600);

  const bookCount = library.books_count ?? (library.books ? library.books.length : 0);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, willChange: 'transform' }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="os-card group !bg-[#0A192F] !border-amber-400/40 hover:!border-amber-400 rounded-3xl p-3.5 sm:p-4 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col h-full relative select-none"
    >
      {/* 1. COVER BANNER HEADER */}
      <div className="relative h-40 sm:h-48 bg-navy-800 rounded-2xl overflow-hidden shrink-0 border border-white/10">
        {coverUrl && !coverErr ? (
          <img
            src={coverUrl}
            alt={`${library.name} Cover`}
            onError={() => setCoverErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-navy-800 to-navy-700 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <Building2 className="w-10 h-10 mb-1 text-gold-500/50" />
            <span className="text-[11px] font-bold uppercase tracking-wider">OpenShelf Partner</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-navy-950/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          {rankIndex !== undefined ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-black shadow-lg uppercase tracking-wider ring-2 ring-amber-400/40">
              <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              #{rankIndex + 1} TOP RATED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-950/90 backdrop-blur-md text-amber-400 border border-amber-400/40 text-[10px] sm:text-[11px] font-extrabold shadow-sm uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              FEATURED PARTNER
            </span>
          )}
        </div>

        {/* Floating Book Count Pill */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-950/85 backdrop-blur-md border border-white/15 text-amber-400 text-[11px] font-black shadow-md">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{bookCount} {bookCount === 1 ? 'Book' : 'Books'}</span>
          </span>
        </div>
      </div>

      {/* 2. OVERLAPPING LOGO AVATAR & CARD CONTENT (Outside overflow-hidden so avatar is never clipped!) */}
      <div className="px-2 flex flex-col flex-grow relative">
        <div className="-mt-7 sm:-mt-8 mb-2.5 relative z-20 flex items-end justify-between">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-0.5 border-2 border-amber-400 shadow-xl overflow-hidden shrink-0 group-hover:scale-105 group-hover:border-amber-300 transition-all duration-300">
            {logoUrl && !logoErr ? (
              <img
                src={logoUrl}
                alt={`${library.name} Logo`}
                onError={() => setLogoErr(true)}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-lg">
                <Building2 className="w-7 h-7 text-slate-950" />
              </div>
            )}
          </div>
        </div>

        {/* Title & Location */}
        <div className="space-y-1 mb-4">
          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1 tracking-tight">
            {library.name}
          </h3>

          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{library.address || 'Phnom Penh, Cambodia'}</span>
          </div>
        </div>

        {/* Action Link Footer */}
        <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
          <motion.div
            initial="rest"
            whileHover="hover"
            className="inline-flex items-center gap-1.5 text-amber-400 font-extrabold text-xs sm:text-sm group-hover:text-amber-300 transition-colors relative z-10 cursor-pointer"
          >
            <span>Visit Library</span>
            <motion.span
              variants={{
                rest: { x: 0 },
                hover: { x: 6, transition: { type: 'spring', stiffness: 400 } }
              }}
              style={{ willChange: 'transform' }}
            >
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </motion.span>
          </motion.div>
          <span className="text-[10px] font-bold text-slate-400">
            OpenShelf Network
          </span>
        </div>
      </div>

      {/* Clickable Card Link Overlay */}
      <Link
        to={`/libraries/${library.id}`}
        className="absolute inset-0 z-30 rounded-3xl focus:outline-none"
        aria-label={`View details for ${library.name}`}
      />
    </motion.div>
  );
}
