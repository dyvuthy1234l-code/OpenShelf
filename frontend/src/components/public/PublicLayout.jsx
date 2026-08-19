import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import PageTransition from '../common/PageTransition';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#102A43] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <PageTransition className="h-full">
          <Outlet />
        </PageTransition>
      </main>
      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  );
}
