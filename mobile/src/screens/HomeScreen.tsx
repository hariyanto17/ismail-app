import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useGetDailyReportQuery } from '../redux/apiSlice';
import { theme } from '../utils/theme';

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  color?: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, subtitle, icon, onPress, color = '#0F5936' }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.cardIconBox, { backgroundColor: color + '15' }]}>
      <Text style={[styles.cardIcon, { color }]}>{icon}</Text>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const getTodayWibString = () => {
    const now = new Date();
    const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    return wib.toISOString().split('T')[0];
  };

  const { data: reportResponse, isLoading: loadingSummary } = useGetDailyReportQuery(getTodayWibString());
  const reportData = reportResponse?.data || { totalTransactions: 0, totalSales: 0 };

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <View style={styles.container}>
      {/* Top Welcome Card */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <View style={styles.welcomeInfo}>
          <Text style={styles.welcomeText}>Selamat Datang,</Text>
          <Text style={styles.nameText}>{user.full_name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Today's Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Today's Summary</Text>
          {loadingSummary ? (
            <ActivityIndicator size="small" color="#0F5936" style={{ marginVertical: theme.spacing.md }} />
          ) : (
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{reportData.totalTransactions}</Text>
                <Text style={styles.summaryLabel}>Transactions</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, styles.greenText]}>
                  Rp{reportData.totalSales.toLocaleString('id-ID')}
                </Text>
                <Text style={styles.summaryLabel}>Total Sales</Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions Group */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <QuickAction
          title="New Transaction"
          subtitle="Add items to cart and check out"
          icon="🛒"
          color="#0F5936"
          onPress={() => navigation.navigate('Cart')}
        />

        {isAdmin && (
          <>
            <QuickAction
              title="Products"
              subtitle="Add, edit, or disable catalog products"
              icon="📦"
              color="#3B82F6"
              onPress={() => navigation.navigate('Products')}
            />

            <QuickAction
              title="Categories"
              subtitle="Configure product classifications"
              icon="🏷️"
              color="#F59E0B"
              onPress={() => navigation.navigate('Categories')}
            />

            <QuickAction
              title="Users"
              subtitle="Manage cashier and admin profiles"
              icon="👥"
              color="#10B981"
              onPress={() => navigation.navigate('Users')}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F5936',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 1,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF5EF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  roleText: {
    fontSize: 9,
    color: '#0F5936',
    fontWeight: '700',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 80,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  greenText: {
    color: '#0F5936',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
    marginLeft: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default HomeScreen;
