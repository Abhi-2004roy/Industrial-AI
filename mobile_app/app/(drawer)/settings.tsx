import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Card, PrimaryButton, SectionTitle, TextField } from '@/components/ui/primitives';
import type { Palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsScreen() {
  const { user } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [company, setCompany] = useState('Industrial AI');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    if (user?.department) setCompany(user.department);
  }, [user?.department]);

  const onToggleDarkMode = () => {
    Haptics.selectionAsync();
    toggleTheme();
  };

  const onSave = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Settings saved', 'Your preferences have been updated.');
  };

  return (
    <Screen title="Settings" subtitle="Manage your account and application preferences.">
      <SectionTitle>Appearance</SectionTitle>
      <Card>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.switchLabel}>Dark Mode</Text>
            <Text style={styles.switchHint}>
              {isDark ? 'Using the dark theme' : 'Using the light theme'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={onToggleDarkMode}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>
      </Card>

      <SectionTitle>Account Settings</SectionTitle>
      <Card>
        <TextField label="Company Name" value={company} onChangeText={setCompany} />

        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.switchLabel}>Email Notifications</Text>
            <Text style={styles.switchHint}>Receive email updates</Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>

        <TextField label="Language" value="English" editable={false} />

        <PrimaryButton label="Save Changes" icon="save-outline" onPress={onSave} />
      </Card>

      <SectionTitle>Security</SectionTitle>
      <Card>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.switchLabel}>Two-Factor Authentication</Text>
            <Text style={styles.switchHint}>Add an extra layer of security</Text>
          </View>
          <Switch
            value={twoFactor}
            onValueChange={setTwoFactor}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>

        <View style={styles.divider} />

        <PrimaryButton
          label="Delete Account"
          variant="danger"
          icon="trash-outline"
          onPress={() =>
            Alert.alert('Delete Account', 'This action is not available in the mobile app yet.')
          }
        />
      </Card>
    </Screen>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 14,
    },
    switchText: {
      flex: 1,
    },
    switchLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
    },
    switchHint: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 2,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      marginBottom: 14,
    },
  });
