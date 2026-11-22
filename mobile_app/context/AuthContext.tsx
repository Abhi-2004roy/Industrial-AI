import * as Haptics from 'expo-haptics';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { authApi, tokenStore, type ApiUser, type RegisterPayload } from '@/services/api';

interface AuthContextValue {
  user: ApiUser | null;
  token: string | null;
  /** `true` while the stored session is being validated on app launch. */
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-login across restarts: validate the SecureStore token against /auth/me.
  const restoreSession = useCallback(async () => {
    try {
      const storedToken = await tokenStore.get();
      if (!storedToken) return;

      setToken(storedToken);
      const currentUser = await authApi.me();
      setUser(currentUser);
    } catch {
      // Token missing/expired/invalid → drop it and fall back to the auth screens.
      await tokenStore.clear();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token: accessToken, user: authUser } = await authApi.login(email, password);
    await tokenStore.set(accessToken);
    setToken(accessToken);
    setUser(authUser);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const signUp = useCallback(async (payload: RegisterPayload) => {
    const { token: accessToken, user: authUser } = await authApi.register(payload);
    await tokenStore.set(accessToken);
    setToken(accessToken);
    setUser(authUser);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore — we still clear the local session below.
    }
    await tokenStore.clear();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
    } catch {
      // Ignore transient failures; the session guard handles real 401s on next request.
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token,
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [user, token, loading, signIn, signUp, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
