import { Link } from 'react-router-dom';
import { BookOpen, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B1F3A] border-t border-[#123A63] text-[#CBD5E1] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#D9A83E] to-[#C9962F] rounded-lg flex items-center justify-center shadow-xs">
                <BookOpen className="w-4 h-4 text-[#0B1F3A]" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-black text-white tracking-tight">OpenShelf</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Cambodia&apos;s digital library network. Connecting readers with physical community libraries across the nation.
            </p>
          </div>

          {/* Discovery Links */}
          <div>
            <h4 className="text-xs font-black text-[#D9A83E] uppercase tracking-wider mb-3">Discovery</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/libraries" className="hover:text-[#D9A83E] transition-colors">Explore Libraries</Link></li>
              <li><Link to="/books" className="hover:text-[#D9A83E] transition-colors">Browse Book Catalogue</Link></li>
              <li><Link to="/categories" className="hover:text-[#D9A83E] transition-colors">Book Categories</Link></li>
            </ul>
          </div>

          {/* Member Links */}
          <div>
            <h4 className="text-xs font-black text-[#D9A83E] uppercase tracking-wider mb-3">Community</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/become-librarian" className="hover:text-[#D9A83E] transition-colors">Become a Librarian</Link></li>
              <li><Link to="/login" className="hover:text-[#D9A83E] transition-colors">Member Sign In</Link></li>
              <li><Link to="/register" className="hover:text-[#D9A83E] transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Platform Info */}
          <div>
            <h4 className="text-xs font-black text-[#D9A83E] uppercase tracking-wider mb-3">About</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              OpenShelf enables community libraries to digitize their catalogue and manage borrowings effortlessly.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#123A63] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#94A3B8] gap-4">
          <p>© {new Date().getFullYear()} OpenShelf Library Network. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-[#C95C57] inline fill-[#C95C57]" /> for Cambodia&apos;s Readers
          </p>
        </div>
      </div>
    </footer>
  );
}
