import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Card, EmptyState, SectionTitle, StatCard } from '@/components/ui/primitives';
import type { Palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  analyticsApi,
  documentsApi,
  type AnalyticsMetrics,
  type ApiDocument,
} from '@/services/api';

export default function DashboardScreen() {
  const { user, refreshUser } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [metricsData, docs] = await Promise.all([
        analyticsApi.metrics(),
        documentsApi.list(),
      ]);
      setMetrics(metricsData);
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refetch on focus so a freshly uploaded document appears in "Recent Documents".
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([load(), refreshUser()]);
  }, [load, refreshUser]);

  const recent = documents.slice(0, 5);

  return (
    <Screen
      title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
      subtitle="Here's what's happening across your knowledge base today."
      refreshing={refreshing}
      onRefresh={onRefresh}>
      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.destructive} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.statsGrid}>
        <StatCard
          label="Total Documents"
          value={metrics?.totalDocuments ?? 0}
          icon="document-text-outline"
          color={colors.primary}
          loading={loading}
        />
        <StatCard
          label="Active Users"
          value={metrics?.activeUsers ?? 0}
          icon="people-outline"
          color={colors.success}
          loading={loading}
        />
        <StatCard
          label="Uploads Today"
          value={metrics?.uploadsToday ?? 0}
          icon="cloud-upload-outline"
          color={colors.accent}
          loading={loading}
        />
        <StatCard
          label="Total Logins"
          value={metrics?.totalLogins ?? 0}
          icon="trending-up-outline"
          color={colors.warning}
          loading={loading}
        />
      </View>

      <SectionTitle>Recent Documents</SectionTitle>
      <Card>
        {recent.length === 0 ? (
          <EmptyState
            icon="file-tray-outline"
            title={loading ? 'Loading…' : 'No documents yet'}
            message="Upload a document to start building your knowledge base."
          />
        ) : (
          recent.map((doc, index) => (
            <View
              key={doc._id}
              style={[styles.docRow, index > 0 && styles.docRowBorder]}>
              <View style={styles.docIcon}>
                <Ionicons name="document-text-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle} numberOfLines={1}>
                  {doc.title}
                </Text>
                <Text style={styles.docMeta} numberOfLines={1}>
                  {doc.description || 'Uncategorized'}
                </Text>
              </View>
              <Text style={styles.docDate}>
                {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
              </Text>
            </View>
          ))
        )}
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
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    docRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
    },
    docRowBorder: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    docIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: `${c.primary}1a`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    docInfo: {
      flex: 1,
    },
    docTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
    },
    docMeta: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 2,
    },
    docDate: {
      fontSize: 12,
      color: c.textMuted,
    },
  });
