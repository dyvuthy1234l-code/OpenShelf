import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

export default function GuestRoute() {
  const { user, subscription, isAuthenticated, loading, initialCheckDone } = useAuth();

  // Still checking auth - do NOT redirect prematurely
  if (loading || !initialCheckDone) {
    return <LoadingScreen message="Checking authentication state..." />;
  }

  const isLibrarianSubActive = subscription && subscription.status === 'active';

  // If already authenticated, redirect to their role destination
  if (isAuthenticated && user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'librarian':
        return isLibrarianSubActive
          ? <Navigate to="/librarian" replace />
          : <Navigate to="/librarian/subscription" replace />;
      case 'member':
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
