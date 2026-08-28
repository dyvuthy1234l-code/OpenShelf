import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

export default function ProtectedRoute({ allowedRoles = [], publicWebsite = false }) {
  const { user, subscription, isAuthenticated, loading, initialCheckDone } = useAuth();
  const location = useLocation();

  // 1. Do NOT redirect while auth is still loading/checking
  if (loading || !initialCheckDone) {
    return <LoadingScreen message="Verifying authentication..." />;
  }

  // 2. Unauthenticated users MUST login first before accessing any route in the project
  if (!isAuthenticated || !user) {
    const requestedUrl = `${location.pathname}${location.search}${location.hash}`;
    const redirectQuery = requestedUrl !== '/' && requestedUrl !== '' && requestedUrl !== '/login'
      ? `?redirect=${encodeURIComponent(requestedUrl)}`
      : '';
    return <Navigate to={`/login${redirectQuery}`} replace />;
  }

  // 3. Authenticated Staff redirected to their dedicated workspaces from public layout
  if (publicWebsite) {
    if (user.role === 'librarian') {
      const isSubActive = subscription && subscription.status === 'active';
      return isSubActive ? <Navigate to="/librarian" replace /> : <Navigate to="/librarian/subscription" replace />;
    }
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Outlet />;
  }

  const isLibrarianSubActive = subscription && subscription.status === 'active';

  // 4. Special Guard for Librarian Workspace (/librarian/*)
  if (allowedRoles.length === 1 && allowedRoles.includes('librarian')) {
    if (user.role !== 'librarian') {
      if (user.role === 'admin') return <Navigate to="/admin" replace />;
      return <Navigate to="/become-librarian" replace />;
    }

    // Role is librarian -> Allow /librarian/subscription even if subscription is inactive or expired!
    if (location.pathname === '/librarian/subscription') {
      return <Outlet />;
    }

    // Role is librarian -> Check active subscription for all other workspace routes!
    if (!isLibrarianSubActive) {
      return <Navigate to="/librarian/subscription" replace />;
    }

    // Role is librarian -> If user has not created a library yet, redirect to /librarian/library
    const hasLibrary = Boolean(user.library || user.library_id);
    const isLibrarySetupPath = location.pathname === '/librarian/library' || location.pathname === '/librarian/profile';
    if (!hasLibrary && !isLibrarySetupPath) {
      return <Navigate to="/librarian/library" replace />;
    }

    return <Outlet />;
  }

  // 5. Role protection for general routes
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
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
