import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Card, PrimaryButton, SectionTitle, StatCard } from '@/components/ui/primitives';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import {
  analyticsApi,
  type AnalyticsMetrics,
  type AnalysisResult,
} from '@/services/api';

const PIE_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b'];

export default function AnalyticsScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      setMetrics(await analyticsApi.metrics());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
  }, [load]);

  const pickPdf = async () => {
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (picked.canceled || picked.assets.length === 0) return;
      const asset = picked.assets[0];
      setFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || 'application/pdf',
      });
      setFileName(asset.name);
      setResult(null);
    } catch {
      setError('Could not open the file picker');
    }
  };

  const analyze = async () => {
    if (!file) return;
    setError('');
    setAnalyzing(true);
    try {
      // Multer field name on the server is `document` (server/routes/analytics.js).
      const formData = new FormData();
      formData.append('document', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as unknown as Blob);

      const analysis = await analyticsApi.analyzePdf(formData);
      setResult(analysis);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze document');
    } finally {
      setAnalyzing(false);
    }
  };

  const maxGrowth = result
    ? Math.max(
        1,
        ...result.growthAndDegradationData.flatMap((d) => [d.valueDegradation, d.companyGrowth])
      )
    : 1;

  return (
    <Screen
      title="Analytics"
      subtitle="Track usage and analyze industrial PDFs with AI."
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
          label="Total Logins"
          value={metrics?.totalLogins ?? 0}
          icon="trending-up-outline"
          color={colors.warning}
          loading={loading}
        />
        <StatCard
          label="Documents Shared"
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
          label="Document Views"
          value={metrics?.viewsThisWeek ?? 0}
          icon="bar-chart-outline"
          color={colors.accent}
          loading={loading}
        />
      </View>

      <SectionTitle>Analyze a PDF</SectionTitle>
      <Card>
        <Pressable
          onPress={pickPdf}
          style={({ pressed }) => [styles.dropzone, pressed && styles.dropzonePressed]}>
          <View style={styles.dropIcon}>
            <Ionicons name="document-outline" size={26} color={colors.primary} />
          </View>
          <Text style={styles.dropTitle} numberOfLines={1}>
            {fileName || 'Tap to select a PDF'}
          </Text>
          <Text style={styles.dropHint}>AI-powered summary and analysis</Text>
        </Pressable>

        <PrimaryButton
          label={analyzing ? 'Analyzing…' : 'Upload & Extract Summary'}
          icon="sparkles-outline"
          onPress={analyze}
          loading={analyzing}
          disabled={!file}
        />
      </Card>

      {result?.summary ? (
        <>
          <SectionTitle>Document Summary</SectionTitle>
          <Card>
            <Text style={styles.summary}>{result.summary}</Text>
          </Card>
        </>
      ) : null}

      {result?.pieChartData?.length ? (
        <>
          <SectionTitle>Risk &amp; Benefit Breakdown</SectionTitle>
          <Card>
            {result.pieChartData.map((datum, index) => (
              <View key={datum.name} style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: PIE_COLORS[index % PIE_COLORS.length] },
                  ]}
                />
                <Text style={styles.legendLabel} numberOfLines={1}>
                  {datum.name}
                </Text>
                <Text style={styles.legendValue}>{datum.value}%</Text>
              </View>
            ))}
          </Card>
        </>
      ) : null}

      {result?.growthAndDegradationData?.length ? (
        <>
          <SectionTitle>Value Degradation vs Company Growth</SectionTitle>
          <Card>
            {result.growthAndDegradationData.map((datum) => (
              <View key={datum.year} style={styles.growthBlock}>
                <Text style={styles.growthYear}>{datum.year}</Text>
                <Bar
                  label="Value Degradation"
                  value={datum.valueDegradation}
                  max={maxGrowth}
                  color={colors.destructive}
                />
                <Bar
                  label="Company Growth"
                  value={datum.companyGrowth}
                  max={maxGrowth}
                  color={colors.success}
                />
              </View>
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

function Bar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, false), [colors]);
  const width = `${Math.max(4, Math.round((value / max) * 100))}%` as const;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width, backgroundColor: color }]} />
      </View>
      <Text style={styles.barValue}>{value}</Text>
    </View>
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
    dropzone: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: c.border,
      borderRadius: 14,
      paddingVertical: 24,
      paddingHorizontal: 16,
      alignItems: 'center',
      gap: 6,
      marginBottom: 16,
    },
    dropzonePressed: {
      borderColor: c.primary,
      backgroundColor: `${c.primary}0a`,
    },
    dropIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: `${c.primary}1a`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
      textAlign: 'center',
    },
    dropHint: {
      fontSize: 13,
      color: c.textMuted,
    },
    summary: {
      fontSize: 14,
      lineHeight: 21,
      color: c.text,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 8,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    legendLabel: {
      flex: 1,
      fontSize: 14,
      color: c.text,
    },
    legendValue: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    growthBlock: {
      marginBottom: 14,
    },
    growthYear: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
      marginBottom: 6,
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    barLabel: {
      width: 120,
      fontSize: 12,
      color: c.textMuted,
    },
    barTrack: {
      flex: 1,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.border,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 4,
    },
    barValue: {
      width: 32,
      textAlign: 'right',
      fontSize: 12,
      color: c.textMuted,
    },
  });
