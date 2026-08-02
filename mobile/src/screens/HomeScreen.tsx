import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { clearCredentials } from '../redux/authSlice';
import { theme } from '../utils/theme';
import BottomTabBar from '../components/BottomTabBar';

interface MenuCardProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ title, subtitle, icon, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.cardIcon}>{icon}</Text>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

export const HomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  const handleLogout = () => {
    dispatch(clearCredentials());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.name}>{user.full_name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Main Menu</Text>

        <MenuCard
          title="New Transaction"
          subtitle="Add items to cart and check out"
          icon="🛒"
          onPress={() => navigation.navigate('Cart')}
        />

        <MenuCard
          title="Transaction History"
          subtitle="View past sales and reprint receipts"
          icon="📋"
          onPress={() => navigation.navigate('History')}
        />

        {isAdmin && (
          <>
            <Text style={styles.sectionTitle}>Administration</Text>

            <MenuCard
              title="Manage Products"
              subtitle="Add, edit or disable catalog items"
              icon="📦"
              onPress={() => navigation.navigate('Products')}
            />

            <MenuCard
              title="Manage Categories"
              subtitle="Configure product classifications"
              icon="🏷️"
              onPress={() => navigation.navigate('Categories')}
            />

            <MenuCard
              title="Manage Users"
              subtitle="Add or edit cashier and admin profiles"
              icon="👥"
              onPress={() => navigation.navigate('Users')}
            />
          </>
        )}

        <Text style={styles.sectionTitle}>System</Text>

        <MenuCard
          title="Printer Settings"
          subtitle="Connect and test Bluetooth printer"
          icon="🖨️"
          onPress={() => navigation.navigate('Settings')}
        />
      </ScrollView>
      <BottomTabBar navigation={navigation} activeTab="Home" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.lg,
    backgroundColor: '#0F5936', // Primary brand green
    borderBottomWidth: 1,
    borderColor: '#0A472B',
  },
  welcome: {
    fontSize: 14,
    color: '#EAF5EF',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0A472B', // Dark green badge
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#0A472B',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#2D7A56',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  menuContainer: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
export default HomeScreen;
