import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useServerWake } from '@/hooks/use-server-wake';

/**
 * Subtle banner shown while a request exceeds 3s — typical of Render's free
 * tier waking from a cold start.
 */
export function ServerWakeBanner() {
  const isWaking = useServerWake();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  if (!isWaking) return null;

  return (
    <View style={styles.banner}>
      <ActivityIndicator size="small" color={colors.accent} />
      <Text style={styles.text}>Waking up server…</Text>
      <Ionicons name="cloud-outline" size={16} color={colors.accent} />
    </View>
  );
}

const createStyles = (c: Palette, dark: boolean) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: dark ? '#431407' : '#fff7ed',
      borderColor: dark ? '#9a3412' : '#fed7aa',
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 12,
    },
    text: {
      flex: 1,
      color: dark ? '#fdba74' : '#9a3412',
      fontSize: 13,
      fontWeight: '500',
    },
  });
