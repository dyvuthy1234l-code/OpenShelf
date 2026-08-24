import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import memberService from '../services/memberService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [subscription, setSubscription] = useState(null);
  const [favoriteBookIds, setFavoriteBookIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const isAuthenticated = !!user;

  // Fetch favorite book IDs from backend for authenticated member only
  const loadFavorites = useCallback(async (role) => {
    const token = localStorage.getItem('token');
    const targetRole = role || user?.role;
    if (!token || targetRole !== 'member') {
      setFavoriteBookIds([]);
      return;
    }

    try {
      const res = await memberService.getFavorites({ per_page: -1 });
      const items = res.data || [];
      const ids = items.map((f) => Number(f.book_id || f.book?.id)).filter(Boolean);
      setFavoriteBookIds(ids);
    } catch {
      setFavoriteBookIds([]);
    }
  }, [user?.role]);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Check auth on mount against backend source of truth
  const checkAuth = useCallback(async () => {
    // If we have a user in localStorage, or just generally want to verify session
    const timer = setTimeout(() => {
      setLoading(false);
      setInitialCheckDone(true);
    }, 2500);

    try {
      const data = await authService.getMe();
      const userData = data.user || data.data;

      if (!userData || userData.status !== 'active') {
        localStorage.removeItem('user');
        setUser(null);
        setSubscription(null);
        setFavoriteBookIds([]);
        return;
      }

      setUser(userData);
      setSubscription(data.subscription || null);
      if (userData?.role === 'member') {
        await loadFavorites('member').catch(() => {});
      } else {
        setFavoriteBookIds([]);
      }
    } catch {
      // Session invalid or expired
      localStorage.removeItem('user');
      setUser(null);
      setSubscription(null);
      setFavoriteBookIds([]);
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setInitialCheckDone(true);
    }
  }, [loadFavorites]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isBookFavorite = useCallback((bookId) => {
    if (!bookId) return false;
    return favoriteBookIds.includes(Number(bookId));
  }, [favoriteBookIds]);

  const toggleFavorite = useCallback(async (bookId) => {
    if (!bookId || user?.role !== 'member') return;
    const numId = Number(bookId);
    const isFav = favoriteBookIds.includes(numId);

    // Optimistic UI update
    setFavoriteBookIds((prev) =>
      isFav ? prev.filter((id) => id !== numId) : [...prev, numId]
    );

    try {
      if (isFav) {
        await memberService.removeFavorite(numId);
      } else {
        await memberService.addFavorite(numId);
      }
    } catch (err) {
      // Revert on error
      setFavoriteBookIds((prev) =>
        isFav ? [...prev, numId] : prev.filter((id) => id !== numId)
      );
      throw err;
    }
  }, [favoriteBookIds, user?.role]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    let userData = data.user || data.data;

    if (userData?.status !== 'active') {
      localStorage.removeItem('user');
      throw new Error('Your account is inactive. Please contact support.');
    }

    setUser(userData);

    try {
      const meData = await authService.getMe();
      setSubscription(meData.subscription || null);
      if (meData.user || meData.data) {
        userData = meData.user || meData.data;
        setUser(userData);
      }
    } catch {
      // Non-critical fallback
    }

    if (userData?.role === 'member') {
      await loadFavorites('member');
    }
    return userData;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    let userData = data.user || data.data;
    setUser(userData);

    try {
      const meData = await authService.getMe();
      setSubscription(meData.subscription || null);
      if (meData.user || meData.data) {
        userData = meData.user || meData.data;
        setUser(userData);
      }
    } catch {
      // Non-critical fallback
    }

    if (userData?.role === 'member') {
      await loadFavorites('member');
    }
    return userData;
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Even if logout API fails, clear local state
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      setSubscription(null);
      setFavoriteBookIds([]);
    }
  };

  const value = {
    user,
    subscription,
    favoriteBookIds,
    isBookFavorite,
    toggleFavorite,
    reloadFavorites: loadFavorites,
    loading,
    initialCheckDone,
    isAuthenticated,
    login,
    register,
    updateUser,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
