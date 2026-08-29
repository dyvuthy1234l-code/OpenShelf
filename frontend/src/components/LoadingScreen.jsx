import OpenShelfLoader from './common/OpenShelfLoader';

export default function LoadingScreen({ message = 'Loading your library...' }) {
  return <div className="min-h-screen bg-navy-950 text-white"><OpenShelfLoader message={message} /></div>;
}
