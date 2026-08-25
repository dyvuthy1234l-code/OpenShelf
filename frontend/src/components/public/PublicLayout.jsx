import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import PageTransition from '../common/PageTransition';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#F7FAFD] text-navy-500 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <PageTransition className="h-full">
          <Outlet />
        </PageTransition>
      </main>
      <div className="shrink-0 hidden md:block">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
