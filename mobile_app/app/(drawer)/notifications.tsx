import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/primitives';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type NotificationType = 'document' | 'user' | 'analytics';

interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

/**
 * Mirrors `client/src/pages/Notifications/Notifications.jsx` (static sample feed —
 * the backend exposes no notifications endpoint yet).
 */
const NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    type: 'document',
    title: 'New Document Uploaded',
    description: 'Safety Manual v2.0 has been added to the knowledge base',
    time: '5 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'user',
    title: 'New Team Member',
    description: 'John Smith has joined your team',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'analytics',
    title: 'Weekly Report',
    description: 'Your weekly analytics report is ready',
    time: '2 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'document',
    title: 'Document Updated',
    description: 'Maintenance Checklist has been updated',
    time: '1 day ago',
    read: true,
  },
];

const ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  document: 'document-text-outline',
  user: 'people-outline',
  analytics: 'trending-up-outline',
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [refreshing, setRefreshing] = useState(false);

  const typeColors: Record<NotificationType, string> = {
    document: colors.primary,
    user: colors.success,
    analytics: colors.accent,
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);

  return (
    <Screen
      title="Notifications"
      subtitle="Stay updated with your team's activities."
      refreshing={refreshing}
      onRefresh={onRefresh}>
      {NOTIFICATIONS.map((notification) => {
        const color = typeColors[notification.type];
        return (
          <Card
            key={notification.id}
            style={[styles.card, notification.read && styles.readCard]}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: `${color}1a` }]}>
                <Ionicons name={ICONS[notification.type]} size={18} color={color} />
              </View>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{notification.title}</Text>
                  <Text style={styles.time}>{notification.time}</Text>
                </View>
                <Text style={styles.description}>{notification.description}</Text>
              </View>
              {!notification.read ? <View style={styles.unreadDot} /> : null}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      marginBottom: 12,
    },
    readCard: {
      opacity: 0.65,
    },
    row: {
      flexDirection: 'row',
      gap: 14,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    title: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
    },
    time: {
      fontSize: 12,
      color: c.textMuted,
    },
    description: {
      marginTop: 4,
      fontSize: 13,
      color: c.textMuted,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.destructive,
      marginTop: 6,
    },
  });
