import { useMemo, type ReactNode } from 'react';
import { Platform, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ServerWakeBanner } from '@/components/ServerWakeBanner';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import {
  KeyboardScrollContext,
  useAnimatedKeyboardHeight,
  useKeyboardAwareScroll,
} from '@/hooks/use-animated-keyboard-height';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  children: ReactNode;
}

/**
 * Shared screen shell: safe area + scrollable body with pull-to-refresh and the
 * cold-start banner. Mirrors the web client's page header spacing.
 *
 * Keyboard handling (Expo Go compatible):
 * - iOS uses `automaticallyAdjustKeyboardInsets` so the focused input scrolls in natively.
 * - Android (edge-to-edge) gets a smooth Reanimated keyboard-driven bottom padding.
 */
export function Screen({ title, subtitle, refreshing = false, onRefresh, children }: ScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { paddingStyle } = useAnimatedKeyboardHeight(40);
  const { scrollRef, setFocusedInput } = useKeyboardAwareScroll();

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <KeyboardScrollContext.Provider value={setFocusedInput}>
        <Animated.ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, Platform.OS === 'android' ? paddingStyle : null]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            ) : undefined
          }>
          <ServerWakeBanner />
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          ) : null}
          {children}
        </Animated.ScrollView>
      </KeyboardScrollContext.Provider>
    </SafeAreaView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: c.text,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 14,
      color: c.textMuted,
    },
  });
