import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { isTablet } from '../utils/device';

interface BottomTabBarProps {
  navigation: any;
  activeTab: 'Home' | 'Cart' | 'History' | 'Products' | 'Settings';
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ navigation, activeTab }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // TabBar only shows on Phone layouts
  if (isTablet()) {
    return null;
  }

  const isAdmin = user?.role === 'ADMIN';

  const tabs = isAdmin
    ? [
        { id: 'Home', label: 'Beranda', icon: '🏠', route: 'Home' },
        { id: 'Cart', label: 'Transaksi', icon: '🛒', route: 'Cart' },
        { id: 'Products', label: 'Produk', icon: '📦', route: 'Products' },
        { id: 'Settings', label: 'Pengaturan', icon: '⚙️', route: 'Settings' },
      ]
    : [
        { id: 'Home', label: 'Beranda', icon: '🏠', route: 'Home' },
        { id: 'Cart', label: 'Transaksi', icon: '🛒', route: 'Cart' },
        { id: 'History', label: 'Riwayat', icon: '📜', route: 'History' },
        { id: 'Settings', label: 'Pengaturan', icon: '⚙️', route: 'Settings' },
      ];

  const handlePress = (route: string) => {
    navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => handlePress(tab.route)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isActive ? styles.activeIcon : styles.inactiveIcon]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive ? styles.activeLabel : styles.inactiveLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 6, // Safe area offset
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeIcon: {
    opacity: 1.0,
  },
  inactiveIcon: {
    opacity: 0.5,
  },
  activeLabel: {
    color: '#0F5936',
  },
  inactiveLabel: {
    color: '#9CA3AF',
  },
});

export default BottomTabBar;
