import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Building2, MapPin, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { getLibraryLogoUrl, getLibraryCoverUrl } from '../../utils/imageUrl';

export default function FeaturedLibraryCard({ library }) {
  const [coverErr, setCoverErr] = useState(false);
  const [logoErr, setLogoErr] = useState(false);

  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-8, 8]);

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
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="os-card group !bg-navy-900 !border-navy-700 hover:!border-navy-600 rounded-3xl p-4 shadow-xl hover:shadow-2xl hover:shadow-navy-950/40 transition-all duration-300 flex flex-col h-full relative select-none"
    >
      {/* 1. COVER BANNER HEADER */}
      <div className="relative h-44 sm:h-52 bg-navy-800 rounded-2xl overflow-hidden shrink-0 border border-white/10">
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
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-950/80 backdrop-blur-md text-gold-400 text-[11px] font-extrabold shadow-sm uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            FEATURED PARTNER
          </span>
        </div>

        {/* Floating Book Count Pill */}
        <div className="absolute bottom-4 right-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-950/80 backdrop-blur-md border border-white/10 text-gold-400 text-[11px] font-extrabold shadow-sm">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{bookCount} {bookCount === 1 ? 'Book' : 'Books'}</span>
          </span>
        </div>

        {/* Overlapping Logo Avatar - inside the cover container but at the bottom edge */}
        <div className="absolute -bottom-4 left-4 z-20">
          <div className="w-16 h-16 rounded-xl bg-navy-800 p-1 border-2 border-navy-900 shadow-xl overflow-hidden shrink-0">
            {logoUrl && !logoErr ? (
              <img
                src={logoUrl}
                alt={`${library.name} Logo`}
                onError={() => setLogoErr(true)}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-navy-700 rounded-lg flex items-center justify-center text-slate-400">
                <Building2 className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. CARD CONTENT */}
      <div className="pt-8 px-2 flex flex-col flex-grow relative">
        
        {/* Title & Location */}
        <div className="space-y-1.5 mb-5">
          <h3 className="text-xl font-semibold text-white group-hover:text-gold-400 transition-colors line-clamp-1 tracking-tight">
            {library.name}
          </h3>

          <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium line-clamp-1">
            <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
            <span className="truncate">{library.address || 'Location not specified'}</span>
          </div>
        </div>

        {/* Push bottom section to the end */}
        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
          <motion.div
            initial="rest"
            whileHover="hover"
            className="inline-flex items-center gap-1.5 text-gold-400 font-bold text-sm hover:text-gold-300 transition-colors relative z-10"
          >
            Visit Library
            <motion.span
              variants={{
                rest: { x: 0 },
                hover: { x: 6, transition: { type: 'spring', stiffness: 400 } }
              }}
              style={{ willChange: 'transform' }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </motion.div>
          <span className="text-[11px] font-semibold text-slate-500">
            OpenShelf Network
          </span>
        </div>
      </div>
      
      {/* Clickable Overlay */}
      <Link to={`/libraries/${library.id}`} className="absolute inset-0 z-0">
        <span className="sr-only">View {library.name}</span>
      </Link>
    </motion.div>
  );
}
