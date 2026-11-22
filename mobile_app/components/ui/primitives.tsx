import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  findNodeHandle,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useKeyboardScrollTarget } from '@/hooks/use-animated-keyboard-height';

// --- Card ------------------------------------------------------------------

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={[styles.card, style]}>{children}</View>;
}

// --- Section title ---------------------------------------------------------

export function SectionTitle({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

// --- Button ----------------------------------------------------------------

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDisabled = disabled || loading;
  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.destructive
        : 'transparent';
  const textColor = variant === 'ghost' ? colors.primary : '#ffffff';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'ghost' && styles.ghostButton,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={textColor} /> : null}
          <Text style={[styles.buttonLabel, { color: textColor }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

// --- Text field ------------------------------------------------------------

interface TextFieldProps extends TextInputProps {
  label?: string;
}

export function TextField({ label, style, onFocus, ...props }: TextFieldProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inputRef = useRef<TextInput>(null);
  const setFocusedInput = useKeyboardScrollTarget();

  // On Android (edge-to-edge) the enclosing scroll view scrolls the focused
  // input above the keyboard. iOS handles this via automaticallyAdjustKeyboardInsets.
  const handleFocus: NonNullable<TextInputProps['onFocus']> = (event) => {
    onFocus?.(event);
    if (Platform.OS !== 'ios' && setFocusedInput) {
      setFocusedInput(findNodeHandle(inputRef.current));
    }
  };

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        ref={inputRef}
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        onFocus={handleFocus}
        {...props}
      />
    </View>
  );
}

// --- Stat card -------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  loading?: boolean;
}

export function StatCard({ label, value, icon, color, loading }: StatCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const accent = color ?? colors.primary;
  return (
    <Card style={styles.statCard}>
      <View style={styles.statTop}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={[styles.statIcon, { backgroundColor: `${accent}1a` }]}>
          <Ionicons name={icon} size={18} color={accent} />
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={accent} style={styles.statLoading} />
      ) : (
        <Text style={styles.statValue}>{value}</Text>
      )}
    </Card>
  );
}

// --- Badge -----------------------------------------------------------------

export function Badge({ label, color }: { label: string; color?: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const accent = color ?? colors.primary;
  return (
    <View style={[styles.badge, { backgroundColor: `${accent}1a`, borderColor: `${accent}33` }]}>
      <Text style={[styles.badgeText, { color: accent }]}>{label}</Text>
    </View>
  );
}

// --- Empty state -----------------------------------------------------------

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  message,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={26} color={colors.muted} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
    </View>
  );
}

// --- Styles ----------------------------------------------------------------

const createStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
      marginBottom: 10,
      marginTop: 4,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    ghostButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.primary,
    },
    buttonLabel: {
      fontSize: 15,
      fontWeight: '600',
    },
    field: {
      marginBottom: 14,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: c.text,
      marginBottom: 6,
    },
    input: {
      backgroundColor: c.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 15,
      color: c.text,
    },
    statCard: {
      flexBasis: '48%',
      flexGrow: 1,
      marginBottom: 12,
    },
    statTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statLabel: {
      fontSize: 13,
      color: c.textMuted,
      fontWeight: '500',
      flexShrink: 1,
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statValue: {
      marginTop: 10,
      fontSize: 26,
      fontWeight: '700',
      color: c.text,
    },
    statLoading: {
      marginTop: 14,
      alignSelf: 'flex-start',
    },
    badge: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    empty: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      gap: 8,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },
    emptyMessage: {
      fontSize: 14,
      color: c.textMuted,
      textAlign: 'center',
      paddingHorizontal: 24,
    },
  });
