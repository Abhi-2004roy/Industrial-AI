import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Card, EmptyState, PrimaryButton } from '@/components/ui/primitives';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { documentsApi, type ApiDocument } from '@/services/api';

export default function DocumentsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setDocuments(await documentsApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refetch every time the screen gains focus so a document uploaded on the
  // Upload screen (or via another device) shows up immediately on return.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
  }, [load]);

  const confirmDelete = (doc: ApiDocument) => {
    Alert.alert('Delete Document', `Delete "${doc.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await documentsApi.remove(doc._id);
            setDocuments((prev) => prev.filter((item) => item._id !== doc._id));
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete document');
          }
        },
      },
    ]);
  };

  return (
    <Screen
      title="Documents"
      subtitle="Manage and organize your industrial documents."
      refreshing={refreshing}
      onRefresh={onRefresh}>
      <PrimaryButton
        label="Upload Document"
        icon="add-outline"
        onPress={() => router.push('/upload')}
        style={styles.uploadButton}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.destructive} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <Card>
          <Text style={styles.mutedCenter}>Loading documents…</Text>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <EmptyState
            icon="file-tray-outline"
            title="No documents yet"
            message="Upload a document to start building your knowledge base."
          />
        </Card>
      ) : (
        documents.map((doc) => (
          <Card key={doc._id} style={styles.docCard}>
            <View style={styles.docHeader}>
              <View style={styles.docIcon}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle} numberOfLines={1}>
                  {doc.title}
                </Text>
                <Text style={styles.docMeta} numberOfLines={1}>
                  {doc.description || 'Uncategorized'}
                </Text>
              </View>
              <Pressable onPress={() => confirmDelete(doc)} hitSlop={10} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              </Pressable>
            </View>
            <View style={styles.docFooter}>
              <Text style={styles.docFooterText}>
                {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
              </Text>
              <Text style={styles.docFooterText}>
                {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ''}
              </Text>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const createStyles = (c: Palette, dark: boolean) =>
  StyleSheet.create({
    uploadButton: {
      marginBottom: 16,
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
      marginBottom: 12,
    },
    errorText: {
      flex: 1,
      color: dark ? '#fca5a5' : '#b91c1c',
      fontSize: 13,
    },
    mutedCenter: {
      textAlign: 'center',
      color: c.textMuted,
      paddingVertical: 20,
    },
    docCard: {
      marginBottom: 12,
    },
    docHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    docIcon: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: `${c.primary}1a`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    docInfo: {
      flex: 1,
    },
    docTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },
    docMeta: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 2,
    },
    deleteButton: {
      padding: 6,
    },
    docFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    docFooterText: {
      fontSize: 12,
      color: c.textMuted,
    },
  });
