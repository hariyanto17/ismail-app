import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useCreateTransactionMutation } from '../redux/apiSlice';
import { clearCart, selectCartTotal } from '../redux/cartSlice';
import { RootState } from '../redux/store';
import { theme } from '../utils/theme';
import PrinterService from '../services/PrinterService';
import Button from '../components/Button';

export const PaymentScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [createTransaction, { isLoading }] = useCreateTransactionMutation();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const total = useSelector(selectCartTotal);

  // States
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');
  const [paidAmount, setPaidAmount] = useState('');
  const [change, setChange] = useState(0);
  const [successTx, setSuccessTx] = useState<any | null>(null);

  // Auto calculate change on Cash paid amount change
  useEffect(() => {
    if (paymentMethod === 'QRIS') {
      setChange(0);
      setPaidAmount(String(total));
    } else {
      const paid = parseInt(paidAmount, 10);
      if (!isNaN(paid) && paid >= total) {
        setChange(paid - total);
      } else {
        setChange(0);
      }
    }
  }, [paidAmount, paymentMethod, total]);

  const handleCheckout = async () => {
    // Validation
    const parsedPaid = parseInt(paidAmount, 10);
    if (paymentMethod === 'CASH' && (isNaN(parsedPaid) || parsedPaid < total)) {
      Alert.alert('Payment Error', 'Paid amount must be equal to or greater than the total amount.');
      return;
    }

    try {
      const payload = {
        payment_method: paymentMethod,
        paid_amount: paymentMethod === 'QRIS' ? total : parsedPaid,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          qty: item.qty,
        })),
      };

      const response = await createTransaction(payload).unwrap();
      if (response.success) {
        setSuccessTx(response.data);
        dispatch(clearCart());
        Alert.alert('Checkout Complete', 'Transaction saved successfully!');
      } else {
        Alert.alert('Checkout Failed', response.message || 'Unknown error');
      }
    } catch (err: any) {
      Alert.alert('Checkout Error', err?.data?.message || 'Server connection issue');
    }
  };

  const handlePrint = async () => {
    if (!successTx) return;
    const receiptText = PrinterService.formatReceipt(successTx);
    await PrinterService.printReceipt(receiptText);
  };

  const handleDone = () => {
    navigation.popToTop();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Payment Method</Text>

      {successTx ? (
        // Checkout Success State
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successText}>Sale Completed!</Text>
          <Text style={styles.invoiceNum}>{successTx.invoice_number}</Text>

          <View style={styles.detailsTable}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount:</Text>
              <Text style={styles.detailVal}>IDR {successTx.total}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Mode:</Text>
              <Text style={styles.detailVal}>{successTx.payment_method}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paid Amount:</Text>
              <Text style={styles.detailVal}>IDR {successTx.paid_amount}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Change Amount:</Text>
              <Text style={styles.detailVal}>IDR {successTx.change_amount}</Text>
            </View>
          </View>

          <Button title="🖨️ Print Receipt" onPress={handlePrint} variant="secondary" style={styles.btn} />
          <Button title="New Transaction" onPress={handleDone} style={styles.btn} />
        </View>
      ) : (
        // Active Checkout Mode
        <View style={styles.card}>
          <View style={styles.amountBox}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT DUE</Text>
            <Text style={styles.totalValue}>IDR {total}</Text>
          </View>

          {/* Payment Method Selectors */}
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[styles.methodBtn, paymentMethod === 'CASH' ? styles.methodBtnSelected : null]}
              onPress={() => setPaymentMethod('CASH')}
            >
              <Text style={styles.methodText}>💵 CASH</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodBtn, paymentMethod === 'QRIS' ? styles.methodBtnSelected : null]}
              onPress={() => setPaymentMethod('QRIS')}
            >
              <Text style={styles.methodText}>📱 QRIS</Text>
            </TouchableOpacity>
          </View>

          {paymentMethod === 'CASH' ? (
            <View style={styles.cashInputBox}>
              <Text style={styles.inputLabel}>Paid Amount (IDR)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Cash Amount"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
                value={paidAmount}
                onChangeText={setPaidAmount}
                autoFocus
              />
              <View style={styles.changeBox}>
                <Text style={styles.changeLabel}>Change:</Text>
                <Text style={styles.changeValue}>IDR {change}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.qrisInfoBox}>
              <Text style={styles.qrisText}>QRIS Payment Selected</Text>
              <Text style={styles.qrisSubtext}>Scan code on POS Terminal to complete payment.</Text>
            </View>
          )}

          <Button
            title="Complete Checkout"
            onPress={handleCheckout}
            isLoading={isLoading}
            style={styles.checkoutBtn}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  amountBox: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  totalLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  totalValue: {
    color: theme.colors.secondary,
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },
  methodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  methodBtn: {
    width: '48%',
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  methodBtnSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.text,
  },
  methodText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  cashInputBox: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 18,
    fontWeight: '600',
  },
  changeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  changeLabel: {
    color: theme.colors.textMuted,
    fontSize: 15,
  },
  changeValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  qrisInfoBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  qrisText: {
    color: theme.colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  qrisSubtext: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  checkoutBtn: {
    marginTop: theme.spacing.sm,
  },
  successCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  successIcon: {
    fontSize: 64,
  },
  successText: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.secondary,
    marginTop: theme.spacing.sm,
  },
  invoiceNum: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  detailsTable: {
    width: '100%',
    marginVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    color: theme.colors.textMuted,
  },
  detailVal: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  btn: {
    marginVertical: theme.spacing.xs,
  },
});
export default PaymentScreen;
