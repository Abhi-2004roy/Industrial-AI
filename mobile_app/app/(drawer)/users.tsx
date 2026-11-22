import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Badge, Card, SectionTitle } from '@/components/ui/primitives';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
}

/**
 * Mirrors `client/src/pages/UserManagement/UserManagement.jsx` (static sample list —
 * the backend exposes no user-management endpoint yet).
 */
const MEMBERS: TeamMember[] = [
  { id: '1', name: 'Alex Morgan', email: 'alex.morgan@industrial.ai', role: 'admin', department: 'Operations', status: 'active' },
  { id: '2', name: 'Sarah Chen', email: 'sarah.chen@industrial.ai', role: 'manager', department: 'Engineering', status: 'active' },
  { id: '3', name: 'Mike Johnson', email: 'mike.johnson@industrial.ai', role: 'operator', department: 'Production', status: 'active' },
  { id: '4', name: 'Lisa Wong', email: 'lisa.wong@industrial.ai', role: 'manager', department: 'Safety', status: 'active' },
  { id: '5', name: 'David Park', email: 'david.park@industrial.ai', role: 'operator', department: 'Maintenance', status: 'inactive' },
  { id: '6', name: 'Tom Baker', email: 'tom.baker@industrial.ai', role: 'viewer', department: 'Logistics', status: 'active' },
];

export default function UsersScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);

  return (
    <Screen
      title="User Management"
      subtitle="Manage your team members and their permissions."
      refreshing={refreshing}
      onRefresh={onRefresh}>
      <SectionTitle>Team Members</SectionTitle>
      {MEMBERS.map((member) => (
        <Card key={member.id} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {member.name}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {member.email}
              </Text>
              <Text style={styles.department}>{member.department}</Text>
            </View>
            <View style={styles.trailing}>
              <Text style={styles.role}>{member.role}</Text>
              <Badge
                label={member.status}
                color={member.status === 'active' ? colors.success : colors.muted}
              />
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '700',
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
    },
    email: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 2,
    },
    department: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 2,
    },
    trailing: {
      alignItems: 'flex-end',
      gap: 6,
    },
    role: {
      fontSize: 12,
      color: c.textMuted,
      textTransform: 'capitalize',
    },
  });
