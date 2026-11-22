import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Badge, Card, PrimaryButton, TextField } from '@/components/ui/primitives';
import type { Palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { authApi, documentsApi, resolveAssetUrl } from '@/services/api';

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(user?.name ?? '');
    setDepartment(user?.department ?? '');
  }, [user?.name, user?.department]);

  const avatarUri = resolveAssetUrl(user?.avatar);
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';

  const pickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Allow photo library access to change your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled || result.assets.length === 0) return;

      const asset = result.assets[0];
      setError('');
      setUploadingAvatar(true);
      await documentsApi.uploadProfileImage({
        uri: asset.uri,
        name: asset.fileName ?? 'avatar.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      });
      await refreshUser();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSave = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await authApi.updateProfile({ name: name.trim(), department: department.trim() });
      await refreshUser();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Profile updated', 'Your profile has been saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      title="Profile"
      subtitle="Manage your personal information."
      refreshing={saving}
      onRefresh={refreshUser}>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Card>
        <View style={styles.avatarBlock}>
          <View style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            )}
            <Pressable
              onPress={pickAvatar}
              disabled={uploadingAvatar}
              hitSlop={8}
              style={({ pressed }) => [styles.cameraButton, pressed && styles.cameraButtonPressed]}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="camera" size={16} color="#ffffff" />
              )}
            </Pressable>
          </View>
          <Text style={styles.avatarName}>{user?.name ?? 'User'}</Text>
          {user?.role ? <Badge label={user.role} /> : null}
        </View>

        <TextField label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
        <TextField label="Email" value={user?.email ?? ''} editable={false} />
        <TextField
          label="Department"
          value={department}
          onChangeText={setDepartment}
          placeholder="e.g. Operations"
        />
        <TextField label="Role" value={user?.role ?? ''} editable={false} />

        <PrimaryButton
          label={saving ? 'Saving…' : 'Update Profile'}
          icon="checkmark-outline"
          onPress={onSave}
          loading={saving}
        />
      </Card>
    </Screen>
  );
}

const createStyles = (c: Palette, dark: boolean) =>
  StyleSheet.create({
    errorBox: {
      backgroundColor: dark ? '#450a0a' : '#fef2f2',
      borderColor: dark ? '#7f1d1d' : '#fecaca',
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: dark ? '#fca5a5' : '#b91c1c',
      fontSize: 13,
    },
    avatarBlock: {
      alignItems: 'center',
      gap: 8,
      marginBottom: 20,
    },
    avatarWrapper: {
      width: 88,
      height: 88,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarImage: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: c.border,
    },
    avatarText: {
      color: '#ffffff',
      fontSize: 34,
      fontWeight: '700',
    },
    cameraButton: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.primary,
      borderWidth: 2,
      borderColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cameraButtonPressed: {
      opacity: 0.85,
    },
    avatarName: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
    },
  });
