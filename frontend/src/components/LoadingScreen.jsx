import OpenShelfLoader from './common/OpenShelfLoader';

export default function LoadingScreen({ message = 'Loading your library...' }) {
  return (
    <div className="min-h-screen bg-[#071325] text-white flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950">
      <div className="relative flex flex-col items-center justify-center">
        {/* Ambient Radial Background Aura */}
        <div className="absolute -inset-16 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Elegant Glass Container */}
        <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-slate-950/80 flex flex-col items-center">
          <OpenShelfLoader message={message} dark />
        </div>
      </div>
    </div>
  );
}
