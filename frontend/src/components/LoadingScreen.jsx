import OpenShelfLoader from './common/OpenShelfLoader';

export default function LoadingScreen() {
  return <div className="min-h-screen bg-navy-950 text-white"><OpenShelfLoader message="Loading your library..." /></div>;
}
