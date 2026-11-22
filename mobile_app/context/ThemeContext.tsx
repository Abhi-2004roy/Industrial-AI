import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform, useColorScheme } from 'react-native';

import { DarkPalette, LightPalette, type Palette } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  /** Active palette — consume this in components so colors react to the theme. */
  colors: Palette;
  isDark: boolean;
  /** `true` until the persisted preference has been read on launch. */
  loading: boolean;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const THEME_KEY = 'industrial_ai_theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Persist the mode with SecureStore on native / localStorage on web. */
const modeStore = {
  async get(): Promise<ThemeMode | null> {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined'
        ? (localStorage.getItem(THEME_KEY) as ThemeMode | null)
        : null;
    }
    return (await SecureStore.getItemAsync(THEME_KEY)) as ThemeMode | null;
  },
  async set(mode: ThemeMode): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_KEY, mode);
      return;
    }
    await SecureStore.setItemAsync(THEME_KEY, mode);
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');
  const [loading, setLoading] = useState(true);

  // Restore the persisted preference across restarts.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await modeStore.get();
        if (active && (stored === 'light' || stored === 'dark')) setModeState(stored);
      } catch {
        // Ignore — fall back to the system/default mode.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    modeStore.set(next).catch(() => {
      // Persisting is best-effort; the in-memory mode still applies.
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState((current) => {
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
      modeStore.set(next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: mode === 'dark' ? DarkPalette : LightPalette,
      isDark: mode === 'dark',
      loading,
      toggleTheme,
      setMode,
    }),
    [mode, loading, toggleTheme, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
