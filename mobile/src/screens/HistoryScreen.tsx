import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useGetTransactionsQuery } from '../redux/apiSlice';
import { theme } from '../utils/theme';
import PrinterService from '../services/PrinterService';
import Button from '../components/Button';
import BottomTabBar from '../components/BottomTabBar';

export const HistoryScreen = ({ navigation }: any) => {
  const { data: response, isLoading } = useGetTransactionsQuery(undefined);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const transactions = response?.data || [];

  const handlePrintReprint = async (tx: any) => {
    const receiptText = PrinterService.formatReceipt(tx);
    await PrinterService.printReceipt(receiptText);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>Riwayat Penjualan</Text>
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Memuat riwayat...</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => setSelectedTx(item)}
              activeOpacity={0.8}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.invoiceNum}>{item.invoice_number}</Text>
                <Text style={styles.metaText}>
                  {item.cashier_name} • {item.payment_method === 'CASH' ? 'TUNAI' : item.payment_method}
                </Text>
                <Text style={styles.dateText}>{new Date(item.created_at).toLocaleString()}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.totalText}>IDR {item.total}</Text>
                <Text style={styles.detailLink}>Lihat Detail →</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Transaction Details Modal */}
      <Modal visible={selectedTx !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTx && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detail Penjualan</Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedTx(null)}>
                    <Text style={styles.closeText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.headerInfo}>
                  <Text style={styles.invoiceLabel}>Nomor Struk</Text>
                  <Text style={styles.invoiceVal}>{selectedTx.invoice_number}</Text>
                  <Text style={styles.metaRow}>Kasir: {selectedTx.cashier_name}</Text>
                  <Text style={styles.metaRow}>Metode: {selectedTx.payment_method === 'CASH' ? 'TUNAI' : selectedTx.payment_method}</Text>
                  <Text style={styles.metaRow}>
                    Tanggal: {new Date(selectedTx.created_at).toLocaleString()}
                  </Text>
                </View>

                <Text style={styles.sectionHeading}>Barang yang Dibeli</Text>
                {selectedTx.items.map((item: any, index: number) => (
                  <View key={index} style={styles.itemDetailRow}>
                    <View style={styles.itemDetailLeft}>
                      <Text style={styles.itemNameText}>{item.product_name}</Text>
                      <Text style={styles.itemMetaText}>
                        IDR {item.price} x {item.qty}
                      </Text>
                    </View>
                    <Text style={styles.itemSubtotalText}>IDR {item.subtotal}</Text>
                  </View>
                ))}

                <View style={styles.summaryBox}>
                  <View style={styles.sumRow}>
                    <Text style={styles.sumLabel}>Total:</Text>
                    <Text style={styles.sumVal}>IDR {selectedTx.total}</Text>
                  </View>
                  <View style={styles.sumRow}>
                    <Text style={styles.sumLabel}>Jumlah Bayar:</Text>
                    <Text style={styles.sumVal}>IDR {selectedTx.paid_amount}</Text>
                  </View>
                  <View style={styles.sumRow}>
                    <Text style={styles.sumLabel}>Kembalian:</Text>
                    <Text style={styles.sumVal}>IDR {selectedTx.change_amount}</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    title="Cetak Ulang Struk"
                    variant="secondary"
                    onPress={() => handlePrintReprint(selectedTx)}
                    style={styles.modalBtn}
                  />
                  <Button
                    title="Tutup"
                    onPress={() => setSelectedTx(null)}
                    style={styles.modalBtn}
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
    backgroundColor: theme.colors.background,
  },
  topHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  loadingText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  rowLeft: {
    flex: 1,
  },
  invoiceNum: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  dateText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  totalText: {
    color: theme.colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  detailLink: {
    color: theme.colors.primary,
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxHeight: '90%',
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
    color: theme.colors.text,
  },
  closeBtn: {
    padding: theme.spacing.sm,
  },
  closeText: {
    color: theme.colors.textMuted,
    fontSize: 18,
  },
  headerInfo: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  invoiceLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  invoiceVal: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  metaRow: {
    color: theme.colors.text,
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeading: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
    letterSpacing: 1,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
  },
  itemDetailLeft: {
    flex: 1,
  },
  itemNameText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  itemMetaText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  itemSubtotalText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  summaryBox: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.md,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sumLabel: {
    color: theme.colors.textMuted,
  },
  sumVal: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  modalBtn: {
    width: '48%',
  },
});
export default HistoryScreen;
