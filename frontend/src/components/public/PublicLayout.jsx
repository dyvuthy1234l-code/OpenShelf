import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import PageTransition from '../common/PageTransition';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-[#102A43] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <PageTransition className="h-full">
          <Outlet />
        </PageTransition>
      </main>
      <div className="shrink-0 pb-16 md:pb-0">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
