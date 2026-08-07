import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Switch, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const productPlaceholder = require('../assets/product-placeholder.png');
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../redux/apiSlice';
import { theme } from '../utils/theme';
import Button from '../components/Button';
import { useConfirmation } from '../components/ConfirmationProvider';

export const ProductsScreen = ({ navigation }: any) => {
  const { data: productsRes, isLoading: loadingProducts } = useGetProductsQuery(undefined);
  const { data: categoriesRes } = useGetCategoriesQuery(undefined);

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const { showConfirmation } = useConfirmation();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const products = productsRes?.data || [];
  const categories = categoriesRes?.data || [];

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setCategoryId(categories[0]?.id || '');
    setIsActive(true);
    setImage(null);
    setImagePreview(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setCategoryId(product.category_id);
    setIsActive(product.is_active);
    setImage(null);
    setImagePreview(product.image_url || null);
    setModalVisible(true);
  };

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          showConfirmation({
            title: 'Gagal Memilih Gambar',
            message: response.errorMessage || 'Terjadi kesalahan',
            confirmText: 'OK',
            variant: 'danger',
          });
          return;
        }
        const asset = response.assets?.[0];
        if (asset?.base64) {
          const dataUri = `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`;
          setImage(dataUri);
          setImagePreview(dataUri);
        }
      }
    );
  };

  const handleSave = async () => {
    const parsedPrice = parseInt(price, 10);

    if (!name.trim()) {
      showConfirmation({
        title: 'Kesalahan Validasi',
        message: 'Nama produk wajib diisi',
        confirmText: 'OK',
        variant: 'warning',
      });
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showConfirmation({
        title: 'Kesalahan Validasi',
        message: 'Harga harus berupa angka bulat positif',
        confirmText: 'OK',
        variant: 'warning',
      });
      return;
    }
    if (!categoryId) {
      showConfirmation({
        title: 'Kesalahan Validasi',
        message: 'Silakan pilih kategori',
        confirmText: 'OK',
        variant: 'warning',
      });
      return;
    }

    try {
      const payload: any = {
        name,
        price: parsedPrice,
        category_id: categoryId,
        is_active: isActive,
      };

      if (image) {
        payload.image = image;
      }

      if (editingId) {
        await updateProduct({ id: editingId, ...payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      setModalVisible(false);
    } catch (err: any) {
      showConfirmation({
        title: 'Gagal Menyimpan',
        message: err?.data?.message || 'Terjadi kesalahan',
        confirmText: 'OK',
        variant: 'danger',
      });
    }
  };

  const handleDelete = (id: string) => {
    showConfirmation({
      title: 'Konfirmasi Hapus',
      message: 'Apakah Anda yakin ingin menghapus produk ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteProduct(id).unwrap();
        } catch (err: any) {
          showConfirmation({
            title: 'Gagal Menghapus',
            message: err?.data?.message || 'Terjadi kesalahan',
            confirmText: 'OK',
            variant: 'danger',
          });
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>Produk</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {loadingProducts ? (
        <Text style={styles.loadingText}>Memuat produk...</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.productThumb} />
              ) : (
                <Image source={productPlaceholder} style={styles.productThumb} />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.category_name} • IDR {item.price}
                </Text>
                <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
                  <Text style={styles.badgeText}>{item.is_active ? 'Aktif' : 'Nonaktif'}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => handleOpenEdit(item)}
                >
                  <Text style={styles.actionText}>Ubah</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.actionText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Ubah Produk' : 'Produk Baru'}</Text>
            
            <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickImage}>
              {imagePreview ? (
                <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
              ) : (
                <Text style={styles.imagePickerText}>Pilih Foto Produk</Text>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Nama Produk"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Harga"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
              value={price}
              onChangeText={setPrice}
            />

            <Text style={styles.label}>Pilih Kategori</Text>
            <View style={styles.pickerContainer}>
              {categories.map((cat: any) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.pickerItem,
                    categoryId === cat.id ? styles.pickerItemSelected : null,
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      categoryId === cat.id ? styles.pickerItemTextSelected : null,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Aktif?</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: theme.colors.surfaceLight, true: theme.colors.primary }}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Batal"
                variant="danger"
                onPress={() => setModalVisible(false)}
                style={styles.halfBtn}
              />
              <Button title="Simpan" onPress={handleSave} style={styles.halfBtn} />
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addBtnText: {
    color: theme.colors.text,
    fontWeight: '700',
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
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  productInfo: {
    flex: 1,
  },
  itemName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  itemMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  badgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text,
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.xs,
  },
  editBtn: {
    backgroundColor: theme.colors.surfaceLight,
  },
  deleteBtn: {
    backgroundColor: theme.colors.danger,
  },
  actionText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: theme.spacing.xs,
  },
  pickerItem: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pickerItemSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.text,
  },
  pickerItemText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  pickerItemTextSelected: {
    color: theme.colors.text,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfBtn: {
    width: '48%',
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  productThumbPlaceholder: {
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  imagePickerButton: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  imagePickerText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
export default ProductsScreen;
