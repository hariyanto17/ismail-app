import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, TextInput, useWindowDimensions, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useGetProductsQuery, useGetCategoriesQuery, useCreateTransactionMutation } from '../redux/apiSlice';
import { addToCart, updateQuantity, removeFromCart, clearCart, selectCartTotal } from '../redux/cartSlice';
import { RootState } from '../redux/store';
import { theme } from '../utils/theme';
import PrinterService from '../services/PrinterService';
import Button from '../components/Button';
import ProductImage from '../components/ProductImage';
import { isTablet } from '../utils/device';
import { CartIcon, CashIcon, QrisIcon } from '../components/Icons';
import { useConfirmation } from '../components/ConfirmationProvider';

interface ProductCardProps {
  item: any;
  cartQty: number;
  onPress: (product: any) => void;
  cardWidth: number;
}

const ProductCard = React.memo(({ item, cartQty, onPress, cardWidth }: ProductCardProps) => {
  return (
    <TouchableOpacity
      style={[styles.productCard, { width: cardWidth, height: cardWidth * 1.35 }]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <ProductImage imageUrl={item.image_url} style={styles.productCardImage} />
      <View style={styles.productCardDetails}>
        <Text style={styles.productCardName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productCardPrice}>IDR {item.price}</Text>
      </View>
      {cartQty > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cartQty}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

export const CartScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const catalogWidth = isTablet() ? width * 0.65 : width;
  const numColumns = isTablet() ? (catalogWidth > 500 ? 4 : 3) : 3;
  const cardWidth = isTablet()
    ? (catalogWidth - 32 - (numColumns * 8)) / numColumns
    : (catalogWidth - 24 - (numColumns * 8)) / numColumns;

  // Redux selectors
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const total = useSelector(selectCartTotal);
  const { user } = useSelector((state: RootState) => state.auth);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');
  const [paidAmount, setPaidAmount] = useState('');
  const [change, setChange] = useState(0);
  const [cartVisible, setCartVisible] = useState(false);

  // RTK Query hooks
  const { data: productsRes, isLoading: loadingProducts } = useGetProductsQuery(undefined);
  const { data: categoriesRes } = useGetCategoriesQuery(undefined);
  const [createTransaction, { isLoading: isCheckingOut }] = useCreateTransactionMutation();
  const { showConfirmation } = useConfirmation();

  const products = productsRes?.data || [];
  const categories = categoriesRes?.data || [];

  const getTodayWibLabel = () => {
    const now = new Date();
    const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${wib.getUTCDate()} ${months[wib.getUTCMonth()]} ${wib.getUTCFullYear()}`;
  };

  // Auto calculate change when cash input or total changes
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

  // Filters
  const activeProducts = products.filter((p: any) => p.is_active);
  const filteredProducts = activeProducts.filter((p: any) => {
    const matchesCategory = selectedCategoryId ? p.category_id === selectedCategoryId : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: any) => {
    dispatch(addToCart(product));
  };

  const handleQtyChange = (productId: string, currentQty: number, delta: number) => {
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ productId, qty: nextQty }));
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showConfirmation({
        title: 'Keranjang Kosong',
        message: 'Silakan tambahkan beberapa produk ke keranjang terlebih dahulu.',
        confirmText: 'OK',
        variant: 'warning',
      });
      return;
    }

    const parsedPaid = parseInt(paidAmount, 10);
    if (paymentMethod === 'CASH' && (isNaN(parsedPaid) || parsedPaid < total)) {
      showConfirmation({
        title: 'Kesalahan Pembayaran',
        message: 'Jumlah pembayaran harus sama dengan atau lebih besar dari total belanja.',
        confirmText: 'OK',
        variant: 'warning',
      });
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
        const txData = response.data;
        showConfirmation({
          title: 'Transaksi Selesai',
          message: `Nomor Struk: ${txData.invoice_number}\nTotal: IDR ${txData.total}`,
          confirmText: 'OK',
          variant: 'success',
          onConfirm: async () => {
            // Auto print receipt
            const receiptText = PrinterService.formatReceipt(txData);
            await PrinterService.printReceipt(receiptText);

            // Auto reset fields for next customer
            dispatch(clearCart());
            setPaidAmount('');
            setSearchQuery('');
            setCartVisible(false);
          },
        });
      } else {
        showConfirmation({
          title: 'Transaksi Gagal',
          message: response.message || 'Kesalahan tidak diketahui',
          confirmText: 'OK',
          variant: 'danger',
        });
      }
    } catch (err: any) {
      showConfirmation({
        title: 'Kesalahan Transaksi',
        message: err?.data?.message || 'Masalah koneksi server',
        confirmText: 'OK',
        variant: 'danger',
      });
    }
  };

  const renderCart = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.cartHeader}>
        <Text style={styles.cartHeaderTitle}>Keranjang Belanja</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.cartCountText}>{cartItems.length} barang</Text>
          {!isTablet() && (
            <TouchableOpacity onPress={() => setCartVisible(false)} style={{ marginLeft: 16 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.cartItemsScrollBox}>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.product.id}
          contentContainerStyle={styles.cartItemsList}
          renderItem={({ item }) => (
            <View style={styles.cartItemRow}>
              <View style={styles.cartItemLeft}>
                <Text style={styles.cartItemName} numberOfLines={1}>{item.product.name}</Text>
                <Text style={styles.cartItemMeta}>IDR {item.product.price}</Text>
              </View>
              <View style={styles.cartItemRight}>
                <Text style={styles.cartItemSubtotal}>IDR {item.product.price * item.qty}</Text>
                <View style={styles.qtyBox}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleQtyChange(item.product.id, item.qty, -1)}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyVal}>{item.qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleQtyChange(item.product.id, item.qty, 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyCartText}>Belum ada produk di keranjang</Text>
          }
        />
      </View>

      {/* Cart Calculations and Payments */}
      {cartItems.length > 0 && (
        <View style={styles.checkoutPanel}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Belanja:</Text>
            <Text style={styles.totalValue}>IDR {total}</Text>
          </View>

          {/* CASH / QRIS Selector */}
          <View style={styles.paymentSelector}>
            <TouchableOpacity
              style={[styles.paymentBtn, paymentMethod === 'CASH' ? styles.paymentBtnSelected : null]}
              onPress={() => setPaymentMethod('CASH')}
            >
              <View style={styles.paymentBtnContent}>
                <CashIcon color={paymentMethod === 'CASH' ? '#FFFFFF' : '#0F5936'} size={18} />
                <Text style={[styles.paymentBtnText, paymentMethod === 'CASH' ? styles.paymentBtnTextSelected : null]}>TUNAI</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentBtn, paymentMethod === 'QRIS' ? styles.paymentBtnSelected : null]}
              onPress={() => setPaymentMethod('QRIS')}
            >
              <View style={styles.paymentBtnContent}>
                <QrisIcon color={paymentMethod === 'QRIS' ? '#FFFFFF' : '#0F5936'} size={18} />
                <Text style={[styles.paymentBtnText, paymentMethod === 'QRIS' ? styles.paymentBtnTextSelected : null]}>QRIS</Text>
              </View>
            </TouchableOpacity>
          </View>

          {paymentMethod === 'CASH' ? (
            <View style={styles.cashBox}>
              <TextInput
                style={styles.cashInput}
                placeholder="Jumlah Bayar (IDR)"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
                value={paidAmount}
                onChangeText={setPaidAmount}
              />
              <View style={styles.changeRow}>
                <Text style={styles.changeLabel}>Kembalian:</Text>
                <Text style={styles.changeVal}>IDR {change}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.qrisBox}>
              <Text style={styles.qrisText}>Pembayaran QRIS: IDR {total}</Text>
            </View>
          )}

          <Button
            title="Bayar & Cetak"
            onPress={handleCheckout}
            isLoading={isCheckingOut}
            style={styles.checkoutButton}
          />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Home Header */}
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.headerTitle}>KOPI WARA</Text>
          <Text style={styles.headerSub}>
            {user?.full_name ? `Cashier: ${user.full_name}` : ''}
          </Text>
        </View>
        <Text style={styles.headerDate}>{getTodayWibLabel()}</Text>
      </View>

      {/* Search and Category Tabs */}
      <View style={styles.topSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari produk berdasarkan nama..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.catBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.catTab, !selectedCategoryId ? styles.catTabSelected : null]}
              onPress={() => setSelectedCategoryId(null)}
            >
              <Text style={[styles.catText, !selectedCategoryId ? styles.catTextSelected : null]}>
                Semua
              </Text>
            </TouchableOpacity>
            {categories.map((cat: any) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catTab, selectedCategoryId === cat.id ? styles.catTabSelected : null]}
                onPress={() => setSelectedCategoryId(cat.id)}
              >
                <Text style={[styles.catText, selectedCategoryId === cat.id ? styles.catTextSelected : null]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Split Layout: Catalog & Cart Side-by-Side or Stacked */}
      <View style={styles.splitBody}>
        {/* Left Side: Product Grid */}
        <View style={[styles.catalogContainer, !isTablet() ? { flex: 1, borderRightWidth: 0 } : null]}>
          <Text style={styles.sectionHeading}>Katalog Produk</Text>
          {loadingProducts ? (
            <Text style={styles.loadingText}>Memuat produk...</Text>
          ) : (
            <FlatList
              key={numColumns.toString()}
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              columnWrapperStyle={styles.rowWrapper}
              contentContainerStyle={styles.catalogGrid}
              renderItem={({ item }) => {
                const cartQty = cartItems.find((ci) => ci.product.id === item.id)?.qty || 0;
                return (
                  <ProductCard
                    item={item}
                    cartQty={cartQty}
                    onPress={handleAddToCart}
                    cardWidth={cardWidth}
                  />
                );
              }}
            />
          )}
        </View>

        {isTablet() && (
          <View style={styles.cartContainer}>
            {renderCart()}
          </View>
        )}
      </View>

      {/* Phone FAB Cart Trigger */}
      {!isTablet() && cartItems.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setCartVisible(true)}
          activeOpacity={0.8}
        >
          <CartIcon color="#FFFFFF" size={24} />
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{cartItems.length}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Phone Bottom Sheet Cart Modal */}
      {!isTablet() && (
        <Modal visible={cartVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setCartVisible(false)} />
            <View style={styles.bottomSheetContainer}>
              {renderCart()}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topSection: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 60,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    backgroundColor: '#FFFFFF', // White
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    color: '#1F2937', // Dark text
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 15,
    marginBottom: theme.spacing.sm,
  },
  catBar: {
    paddingBottom: theme.spacing.sm,
  },
  catTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.round,
    backgroundColor: '#FFFFFF',
    borderColor: '#0F5936',
    borderWidth: 1,
    marginRight: theme.spacing.xs,
  },
  catTabSelected: {
    backgroundColor: '#0F5936',
    borderColor: '#0F5936',
  },
  catText: {
    color: '#0F5936',
    fontSize: 13,
    fontWeight: '600',
  },
  catTextSelected: {
    color: '#FFFFFF',
  },
  splitBody: {
    flex: 1,
    flexDirection: 'row',
  },
  catalogContainer: {
    flex: 0.65, // 65% panel width
    borderRightWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  catalogGrid: {
    paddingBottom: 40,
  },
  rowWrapper: {
    justifyContent: 'flex-start', // Use flex-start so compact columns wrap neatly
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    padding: theme.spacing.sm,
    justifyContent: 'space-between',
    margin: 4, // Spacing: 8px between cards (margin 4 on each side)
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardImage: {
    height: '60%',
    width: '100%',
    borderRadius: 8,
  },
  productCardDetails: {
    height: '40%',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '600',
  },
  productCardName: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
  productCardPrice: {
    color: '#0F5936', // Primary POS green
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  cartContainer: {
    flex: 0.35, // 35% panel width
    backgroundColor: '#FFFFFF', // White cart body background
    justifyContent: 'space-between',
    borderLeftWidth: 1,
    borderColor: '#E5E7EB',
  },
  cartHeader: {
    backgroundColor: '#0F5936', // Brand green header
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cartCountText: {
    color: '#EAF5EF',
    fontSize: 13,
    fontWeight: '600',
  },
  cartItemsScrollBox: {
    flex: 1,
    padding: theme.spacing.md,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  cartItemsList: {
    paddingBottom: 20,
  },
  cartItemRow: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
  },
  cartItemLeft: {
    flex: 1,
    marginBottom: 4,
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  cartItemMeta: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  cartItemRight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemSubtotal: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
  },
  qtyBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  qtyBtnText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  qtyVal: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  emptyCartText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  checkoutPanel: {
    borderTopWidth: 1,
    borderColor: '#0F5936',
    padding: theme.spacing.md,
    backgroundColor: '#EAF5EF', // Footer Total light green background
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F5936',
  },
  paymentSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  paymentBtn: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentBtnSelected: {
    backgroundColor: '#0F5936',
    borderColor: '#0F5936',
  },
  paymentBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentBtnText: {
    color: '#0F5936',
    fontSize: 14,
    fontWeight: '700',
  },
  paymentBtnTextSelected: {
    color: '#FFFFFF',
  },
  cashBox: {
    marginBottom: theme.spacing.sm,
  },
  cashInput: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    fontSize: 14,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  changeLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  changeVal: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  qrisBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 8,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  qrisText: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  checkoutButton: {
    paddingVertical: theme.spacing.sm,
  },
  loadingText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#0F5936',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 24,
  },
  fabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    height: '75%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.md,
    paddingTop: 50,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F5936',
  },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
});
export default CartScreen;
