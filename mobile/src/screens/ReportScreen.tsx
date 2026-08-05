import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions, useWindowDimensions } from 'react-native';
import { useGetDailyReportQuery } from '../redux/apiSlice';
import { theme } from '../utils/theme';
import PrinterService from '../services/PrinterService';
import Button from '../components/Button';
import { DateSelector } from '../components/DateSelector';
import {
  HistoryIcon,
  CashIcon,
  QrisIcon,
  RightIcon,
  InfoIcon,
} from '../components/Icons';

export const ReportScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  });
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const getFormatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const dateStr = getFormatDateStr(selectedDate);
  const { data: response, isLoading } = useGetDailyReportQuery(dateStr);

  const reportData = response?.data || {
    date: dateStr,
    totalTransactions: 0,
    totalSales: 0,
    cashSales: 0,
    qrisSales: 0,
    transactions: [],
  };

  const handlePrintReprint = async (tx: any) => {
    const formattedTx = {
      invoice_number: tx.invoice_number,
      created_at: tx.created_at,
      cashier_name: tx.cashier_name,
      total: tx.total,
      payment_method: tx.payment_method,
      paid_amount: tx.paid_amount,
      change_amount: tx.change_amount,
      items: tx.items.map((item: any) => ({
        product_name: item.product_name,
        qty: item.qty,
        price: item.price,
        subtotal: item.subtotal,
      })),
    };
    const receiptText = PrinterService.formatReceipt(formattedTx);
    await PrinterService.printReceipt(receiptText);
  };

  const SkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonIcon} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.skeletonLineShort} />
          <View style={[styles.skeletonLineLong, { marginTop: 8 }]} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.reportHeader}>
        <Text style={styles.headerTitle}>Sales Report</Text>
      </View>

      {/* Date Selector Card */}
      <DateSelector
        selectedDate={selectedDate}
        onChange={setSelectedDate}
        loading={isLoading}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Summary Grid */}
        <View style={[styles.summaryGrid, isTablet ? styles.summaryGridTablet : styles.summaryGridPhone]}>
          <View style={[styles.statCard, isTablet ? styles.statCardTablet : styles.statCardPhone]}>
            <View style={[styles.statIconBox, { backgroundColor: '#EAF5EF' }]}>
              <HistoryIcon color="#0F5936" size={22} />
            </View>
            <Text style={styles.statValue}>{reportData.totalTransactions}</Text>
            <Text style={styles.statLabel}>Total Transaksi</Text>
          </View>

          <View style={[styles.statCard, isTablet ? styles.statCardTablet : styles.statCardPhone]}>
            <View style={[styles.statIconBox, { backgroundColor: '#E0F2FE' }]}>
              <CashIcon color="#0284C7" size={22} />
            </View>
            <Text style={styles.statValue}>Rp{reportData.totalSales.toLocaleString('id-ID')}</Text>
            <Text style={styles.statLabel}>Total Penjualan</Text>
          </View>

          <View style={[styles.statCard, isTablet ? styles.statCardTablet : styles.statCardPhone]}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEE2E2' }]}>
              <CashIcon color="#EF4444" size={22} />
            </View>
            <Text style={styles.statValue}>Rp{reportData.cashSales.toLocaleString('id-ID')}</Text>
            <Text style={styles.statLabel}>Penjualan Tunai</Text>
          </View>

          <View style={[styles.statCard, isTablet ? styles.statCardTablet : styles.statCardPhone]}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
              <QrisIcon color="#D97706" size={22} />
            </View>
            <Text style={styles.statValue}>Rp{reportData.qrisSales.toLocaleString('id-ID')}</Text>
            <Text style={styles.statLabel}>Penjualan QRIS</Text>
          </View>
        </View>

        {/* Transaction History Section */}
        <Text style={styles.sectionTitle}>Transactions</Text>
        
        {isLoading ? (
          <View style={{ gap: 12 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : reportData.transactions.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconBox}>
              <InfoIcon color="#9CA3AF" size={32} />
            </View>
            <Text style={styles.emptyTitle}>Tidak ada transaksi.</Text>
            <Text style={styles.emptyText}>Pilih tanggal lain di bagian atas untuk melihat riwayat penjualan.</Text>
          </View>
        ) : (
          reportData.transactions.map((tx: any) => (
            <TouchableOpacity
              key={tx.id}
              style={styles.txCard}
              onPress={() => setSelectedTx(tx)}
              activeOpacity={0.8}
            >
              <View style={styles.txIconBox}>
                <HistoryIcon color="#6B7280" size={20} />
              </View>
              
              <View style={styles.txDetails}>
                <Text style={styles.txInvoice}>{tx.invoice_number}</Text>
                <Text style={styles.txMeta}>
                  {new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {tx.cashier_name}
                </Text>
              </View>

              <View style={styles.txRight}>
                <Text style={styles.txTotal}>Rp{tx.total.toLocaleString('id-ID')}</Text>
                <View style={[
                  styles.paymentBadge,
                  tx.payment_method === 'CASH' ? styles.badgeCash : styles.badgeQris
                ]}>
                  <Text style={[
                    styles.badgeText,
                    tx.payment_method === 'CASH' ? styles.badgeTextCash : styles.badgeTextQris
                  ]}>
                    {tx.payment_method === 'CASH' ? 'Tunai' : 'QRIS'}
                  </Text>
                </View>
              </View>

              <RightIcon color="#9CA3AF" size={16} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Transaction Detail Modal */}
      <Modal visible={selectedTx !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTx && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Transaction Details</Text>
                  <TouchableOpacity onPress={() => setSelectedTx(null)}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.metaBox}>
                  <Text style={styles.metaRow}>Invoice: {selectedTx.invoice_number}</Text>
                  <Text style={styles.metaRow}>Cashier: {selectedTx.cashier_name}</Text>
                  <Text style={styles.metaRow}>
                    Date: {new Date(selectedTx.created_at).toLocaleString('id-ID')}
                  </Text>
                  <Text style={styles.metaRow}>Payment: {selectedTx.payment_method}</Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.itemsTitle}>Items</Text>
                {selectedTx.items.map((item: any) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemName}>{item.product_name}</Text>
                      <Text style={styles.itemMeta}>
                        {item.qty} x Rp{item.price.toLocaleString('id-ID')}
                      </Text>
                    </View>
                    <Text style={styles.itemSubtotal}>
                      Rp{item.subtotal.toLocaleString('id-ID')}
                    </Text>
                  </View>
                ))}

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValModal}>
                    Rp{selectedTx.total.toLocaleString('id-ID')}
                  </Text>
                </View>
                {selectedTx.payment_method === 'CASH' && (
                  <>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Paid Amount:</Text>
                      <Text style={styles.paidVal}>
                        Rp{selectedTx.paid_amount.toLocaleString('id-ID')}
                      </Text>
                    </View>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Change:</Text>
                      <Text style={styles.changeVal}>
                        Rp{selectedTx.change_amount.toLocaleString('id-ID')}
                      </Text>
                    </View>
                  </>
                )}

                <View style={styles.modalActions}>
                  <Button
                    title="Reprint Receipt"
                    onPress={() => handlePrintReprint(selectedTx)}
                    style={styles.modalBtn}
                  />
                  <Button
                    title="Close"
                    onPress={() => setSelectedTx(null)}
                    style={styles.modalBtn}
                    variant="secondary"
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  reportHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 80,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    gap: 12,
  },
  summaryGridTablet: {},
  summaryGridPhone: {},
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardTablet: {
    width: '48%',
  },
  statCardPhone: {
    width: '48%',
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: theme.spacing.sm,
  },
  txCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  txIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  txDetails: {
    flex: 1,
  },
  txInvoice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  txMeta: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    marginRight: 4,
  },
  txTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F5936',
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  badgeCash: {
    backgroundColor: '#EAF5EF',
    borderColor: '#0F5936',
  },
  badgeQris: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextCash: {
    color: '#0F5936',
  },
  badgeTextQris: {
    color: '#0284C7',
  },
  emptyStateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: theme.spacing.md,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  skeletonLineShort: {
    width: '40%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  skeletonLineLong: {
    width: '80%',
    height: 10,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: theme.spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeBtnText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  metaBox: {
    backgroundColor: '#F9FAFB',
    padding: theme.spacing.md,
    borderRadius: 10,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    fontSize: 12,
    color: '#4B5563',
    marginVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: theme.spacing.md,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: theme.spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  itemMeta: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  totalValModal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F5936',
  },
  paidVal: {
    fontSize: 14,
    color: '#1F2937',
  },
  changeVal: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  modalActions: {
    marginTop: theme.spacing.lg,
  },
  modalBtn: {
    marginVertical: theme.spacing.xs,
  },
});

export default ReportScreen;
