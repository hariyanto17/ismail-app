import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { clearCredentials } from '../redux/authSlice';
import { theme } from '../utils/theme';
import {
  ProductIcon,
  CategoryIcon,
  UsersIcon,
  PrinterIcon,
  HistoryIcon,
  InfoIcon,
  LogoutIcon,
  RightIcon,
  SettingsIcon,
  ReportIcon,
} from '../components/Icons';
import { useConfirmation } from '../components/ConfirmationProvider';

export const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showConfirmation } = useConfirmation();

  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => {
    showConfirmation({
      title: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar dari POS Kafe?',
      confirmText: 'Keluar',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: () => {
        dispatch(clearCredentials());
      },
    });
  };

  const handleAbout = () => {
    showConfirmation({
      title: 'Tentang POS Kafe',
      message: 'POS Kafe MVP\nVersi 1.0.0\n\nDioptimalkan untuk operasional harian yang cepat dan pencetakan kepadatan tinggi.',
      confirmText: 'OK',
      variant: 'info',
    });
  };

  const MenuItem = ({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={styles.iconWrapper}>{icon}</View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <RightIcon color="#9CA3AF" size={16} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header Card */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.fullName}>{user?.full_name || 'Pengguna Kafe'}</Text>
        <Text style={styles.username}>@{user?.username || 'username'}</Text>
        
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role || 'CASHIER'}</Text>
        </View>
      </View>

      {/* Operations Menu Group */}
      <View style={styles.menuGroup}>
        <Text style={styles.groupHeader}>Operasional</Text>
        <View style={styles.groupCard}>
          <MenuItem
            icon={<PrinterIcon color="#0F5936" size={20} />}
            label="Pengaturan Printer"
            onPress={() => navigation.navigate('Settings')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={<HistoryIcon color="#0F5936" size={20} />}
            label="Riwayat Transaksi"
            onPress={() => navigation.navigate('History')}
          />
        </View>
      </View>

      {/* Analytics Menu Group */}
      {isAdmin && (
        <View style={styles.menuGroup}>
          <Text style={styles.groupHeader}>Analisis</Text>
          <View style={styles.groupCard}>
            <MenuItem
              icon={<ReportIcon color="#0F5936" size={20} />}
              label="Analisis Harian"
              onPress={() => navigation.navigate('DailyAnalytics')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={<ReportIcon color="#0F5936" size={20} />}
              label="Analisis Bulanan"
              onPress={() => navigation.navigate('MonthlyAnalytics')}
            />
          </View>
        </View>
      )}

      {/* Administrator Menu Group */}
      {isAdmin && (
        <View style={styles.menuGroup}>
          <Text style={styles.groupHeader}>Manajemen</Text>
          <View style={styles.groupCard}>
            <MenuItem
              icon={<SettingsIcon color="#0F5936" size={20} />}
              label="Pengaturan Toko"
              onPress={() => navigation.navigate('StoreSettings')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={<ProductIcon color="#0F5936" size={20} />}
              label="Produk"
              onPress={() => navigation.navigate('Products')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={<CategoryIcon color="#0F5936" size={20} />}
              label="Kategori"
              onPress={() => navigation.navigate('Categories')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={<UsersIcon color="#0F5936" size={20} />}
              label="Pengguna"
              onPress={() => navigation.navigate('Users')}
            />
          </View>
        </View>
      )}

      {/* Application Menu Group */}
      <View style={styles.menuGroup}>
        <Text style={styles.groupHeader}>Aplikasi</Text>
        <View style={styles.groupCard}>
          <MenuItem
            icon={<InfoIcon color="#0F5936" size={20} />}
            label="Tentang"
            onPress={handleAbout}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={<LogoutIcon color="#DC2626" size={20} />}
            label="Keluar"
            onPress={handleLogout}
          />
        </View>
      </View>

      <Text style={styles.versionText}>Versi Aplikasi 1.0.0 (MVP)</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F5936',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatarText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fullName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  username: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#EAF5EF',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: theme.spacing.sm,
  },
  roleText: {
    fontSize: 11,
    color: '#0F5936',
    fontWeight: '700',
  },
  menuGroup: {
    marginBottom: theme.spacing.lg,
  },
  groupHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
    marginLeft: 4,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: '#FFFFFF',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginRight: theme.spacing.md,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: theme.spacing.md,
  },
});

export default ProfileScreen;
