import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Returns a function that navigates the user to the correct
 * destination based on their real backend role ('member', 'librarian', 'admin').
 *
 * If a custom redirect path exists (e.g. /member/borrowings), it honors it for members.
 */
export function useAuthRedirect() {
  const navigate = useNavigate();

  const redirectByRole = useCallback((user, customRedirect = null) => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Read real backend user role
    const role = user.role;

    if (role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }

    if (role === 'librarian') {
      navigate('/librarian', { replace: true });
      return;
    }

    // For member role:
    if (customRedirect && typeof customRedirect === 'string' && customRedirect.startsWith('/') && !customRedirect.startsWith('/login') && !customRedirect.startsWith('/register')) {
      navigate(customRedirect, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return { redirectByRole };
}
