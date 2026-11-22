import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import * as Haptics from 'expo-haptics';
import { usePathname } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DRAWER_ITEMS } from '@/constants/navigation';
import type { Palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { resolveAssetUrl } from '@/services/api';

/**
 * Custom scrollable drawer menu: brand header, the same left-sidebar sections as
 * the web client (`client/src/components/navigation/Sidebar.jsx`), the logged-in
 * user's name/email, a light/dark quick toggle and a Logout button that clears
 * SecureStore.
 */
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const avatarUri = resolveAssetUrl(user?.avatar);

  const isActive = (name: string) => pathname === (name === 'index' ? '/' : `/${name}`);

  const onNavigate = (name: string) => {
    Haptics.selectionAsync();
    props.navigation.navigate(name);
  };

  const onToggleTheme = () => {
    Haptics.selectionAsync();
    toggleTheme();
  };

  const onLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    props.navigation.closeDrawer();
    await signOut();
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
      style={styles.drawer}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>IAI</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>Industrial AI</Text>
          <Text style={styles.brandSubtitle}>Knowledge Hub</Text>
        </View>
      </View>

      <View style={styles.nav}>
        {DRAWER_ITEMS.map((item) => {
          const active = isActive(item.name);
          return (
            <Pressable
              key={item.name}
              onPress={() => onNavigate(item.name)}
              style={({ pressed }) => [
                styles.navItem,
                active && styles.navItemActive,
                pressed && !active && styles.navItemPressed,
              ]}>
              <Ionicons
                name={item.icon}
                size={20}
                color={active ? '#ffffff' : colors.sidebarText}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'U'}</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name ?? 'User'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email ?? ''}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onToggleTheme}
          style={({ pressed }) => [styles.themeToggle, pressed && styles.themeTogglePressed]}>
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={18}
            color={colors.sidebarText}
          />
          <Text style={styles.themeToggleText}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
        </Pressable>

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}>
          <Ionicons name="log-out-outline" size={20} color="#fecaca" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerTitle: 'Industrial AI',
          headerTitleAlign: 'left',
          headerStyle: { backgroundColor: colors.primaryDark },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          drawerStyle: { backgroundColor: colors.sidebar, width: 288 },
          drawerType: 'front',
        }}>
        <Drawer.Screen name="index" />
        <Drawer.Screen name="documents" />
        <Drawer.Screen name="upload" />
        <Drawer.Screen name="ai-chat" />
        <Drawer.Screen name="analytics" />
        <Drawer.Screen name="notifications" />
        <Drawer.Screen name="users" />
        <Drawer.Screen name="settings" />
        <Drawer.Screen name="profile" />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    drawer: {
      backgroundColor: c.sidebar,
    },
    drawerContent: {
      flexGrow: 1,
      backgroundColor: c.sidebar,
      paddingBottom: 16,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.sidebarHover,
    },
    logo: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: '#ffffff',
      fontWeight: '700',
      fontSize: 15,
    },
    brandTitle: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    brandSubtitle: {
      color: c.sidebarText,
      fontSize: 12,
    },
    nav: {
      paddingHorizontal: 12,
      paddingTop: 12,
      gap: 4,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 10,
    },
    navItemActive: {
      backgroundColor: c.sidebarActive,
    },
    navItemPressed: {
      backgroundColor: c.sidebarHover,
    },
    navLabel: {
      color: c.sidebarText,
      fontSize: 15,
      fontWeight: '500',
    },
    navLabelActive: {
      color: '#ffffff',
      fontWeight: '600',
    },
    footer: {
      marginTop: 'auto',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.sidebarHover,
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 14,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    avatarText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    userEmail: {
      color: c.sidebarText,
      fontSize: 12,
    },
    themeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.sidebarHover,
      backgroundColor: c.sidebarHover,
      paddingVertical: 10,
    },
    themeTogglePressed: {
      opacity: 0.85,
    },
    themeToggleText: {
      color: c.sidebarText,
      fontSize: 14,
      fontWeight: '600',
    },
    logout: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: '#7f1d1d',
      backgroundColor: '#450a0a',
      paddingVertical: 12,
    },
    logoutPressed: {
      opacity: 0.85,
    },
    logoutText: {
      color: '#fecaca',
      fontSize: 15,
      fontWeight: '600',
    },
  });
