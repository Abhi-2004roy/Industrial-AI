import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, TextField } from '@/components/ui/primitives';
import type { Palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  KeyboardScrollContext,
  useAnimatedKeyboardHeight,
  useKeyboardAwareScroll,
} from '@/hooks/use-animated-keyboard-height';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { paddingStyle } = useAnimatedKeyboardHeight(24);
  const { scrollRef, setFocusedInput } = useKeyboardAwareScroll();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email and password are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await signUp({ name: name.trim(), email: email.trim(), password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardScrollContext.Provider value={setFocusedInput}>
        <Animated.ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.content,
            Platform.OS === 'android' ? paddingStyle : undefined,
          ]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>IAI</Text>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the Industrial AI Knowledge Hub</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.destructive} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TextField
            label="Full name"
            value={name}
            onChangeText={setName}
            placeholder="Jane Doe"
            autoCapitalize="words"
          />

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            textContentType="newPassword"
          />

          <TextField
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            secureTextEntry
          />

          <PrimaryButton
            label="Create Account"
            onPress={onSubmit}
            loading={busy}
            icon="person-add-outline"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.replace('/login')} hitSlop={8}>
              <Text style={styles.link}>Sign in</Text>
            </Pressable>
          </View>
        </Animated.ScrollView>
      </KeyboardScrollContext.Provider>
    </SafeAreaView>
  );
}

const createStyles = (c: Palette, dark: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    brand: {
      alignItems: 'center',
      marginBottom: 28,
    },
    logo: {
      width: 56,
      height: 56,
      borderRadius: 14,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    logoText: {
      color: '#ffffff',
      fontWeight: '700',
      fontSize: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: c.text,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 14,
      color: c.textMuted,
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: dark ? '#450a0a' : '#fef2f2',
      borderColor: dark ? '#7f1d1d' : '#fecaca',
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      flex: 1,
      color: dark ? '#fca5a5' : '#b91c1c',
      fontSize: 13,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    footerText: {
      color: c.textMuted,
      fontSize: 14,
    },
    link: {
      color: c.primary,
      fontSize: 14,
      fontWeight: '600',
    },
  });
