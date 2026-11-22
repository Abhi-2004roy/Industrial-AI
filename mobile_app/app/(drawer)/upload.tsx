import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Card, PrimaryButton, TextField } from '@/components/ui/primitives';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { documentsApi } from '@/services/api';

interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export default function UploadScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [file, setFile] = useState<PickedFile | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.*', 'text/plain'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || result.assets.length === 0) return;
      const asset = result.assets[0];
      setFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || 'application/octet-stream',
        size: asset.size,
      });
      if (!title) setTitle(asset.name.replace(/\.[^.]+$/, ''));
      setError('');
    } catch {
      setError('Could not open the file picker');
    }
  };

  const onSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a document title');
      return;
    }
    setError('');
    setUploading(true);
    try {
      // Multer field name on the server is `file` (server/routes/documents.js) and
      // the value must be an RN file descriptor `{ uri, name, type }` for Android/iOS.
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as unknown as Blob);
      formData.append('title', title.trim());
      formData.append('description', description.trim());

      await documentsApi.upload(formData);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Upload complete', 'Your document was uploaded successfully.');
      router.push('/documents');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      // Surface backend validation errors (Multer / express-validator / ApiError) for debugging.
      console.warn('[upload] failed:', message, err);
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Screen title="Upload Document" subtitle="Add a new document to your knowledge base.">
      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.destructive} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Card>
        <Pressable
          onPress={pickFile}
          style={({ pressed }) => [styles.dropzone, pressed && styles.dropzonePressed]}>
          <View style={styles.dropIcon}>
            <Ionicons
              name={file ? 'document-text-outline' : 'cloud-upload-outline'}
              size={30}
              color={colors.primary}
            />
          </View>
          {file ? (
            <>
              <Text style={styles.dropTitle} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={styles.dropHint}>
                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Selected'} · Tap to change
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.dropTitle}>Tap to browse for a file</Text>
              <Text style={styles.dropHint}>PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT</Text>
            </>
          )}
        </Pressable>

        {file ? (
          <Pressable onPress={() => setFile(null)} style={styles.removeRow} hitSlop={8}>
            <Ionicons name="close-circle-outline" size={16} color={colors.destructive} />
            <Text style={styles.removeText}>Remove file</Text>
          </Pressable>
        ) : null}

        <TextField
          label="Document Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter document title"
        />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Brief description of the document"
          multiline
        />

        <PrimaryButton
          label={uploading ? 'Uploading…' : 'Upload Document'}
          icon="cloud-upload-outline"
          onPress={onSubmit}
          loading={uploading}
          disabled={!file}
        />
      </Card>
    </Screen>
  );
}

const createStyles = (c: Palette, dark: boolean) =>
  StyleSheet.create({
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
    dropzone: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: c.border,
      borderRadius: 14,
      paddingVertical: 32,
      paddingHorizontal: 16,
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    dropzonePressed: {
      borderColor: c.primary,
      backgroundColor: `${c.primary}0a`,
    },
    dropIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: `${c.primary}1a`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    dropTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
    },
    dropHint: {
      fontSize: 13,
      color: c.textMuted,
      textAlign: 'center',
    },
    removeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 16,
    },
    removeText: {
      color: c.destructive,
      fontSize: 13,
      fontWeight: '600',
    },
  });
