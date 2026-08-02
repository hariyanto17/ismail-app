import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, Switch } from 'react-native';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../redux/apiSlice';
import { theme } from '../utils/theme';
import Button from '../components/Button';
import BottomTabBar from '../components/BottomTabBar';

export const ProductsScreen = ({ navigation }: any) => {
  const { data: productsRes, isLoading: loadingProducts } = useGetProductsQuery(undefined);
  const { data: categoriesRes } = useGetCategoriesQuery(undefined);

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);

  const products = productsRes?.data || [];
  const categories = categoriesRes?.data || [];

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setCategoryId(categories[0]?.id || '');
    setIsActive(true);
    setModalVisible(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setCategoryId(product.category_id);
    setIsActive(product.is_active);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const parsedPrice = parseInt(price, 10);

    if (!name.trim()) {
      Alert.alert('Validation Error', 'Product name is required');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Validation Error', 'Price must be a positive integer');
      return;
    }
    if (!categoryId) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }

    try {
      const payload = {
        name,
        price: parsedPrice,
        category_id: categoryId,
        is_active: isActive,
      };

      if (editingId) {
        await updateProduct({ id: editingId, ...payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error Saving', err?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(id).unwrap();
          } catch (err: any) {
            Alert.alert('Delete Failed', err?.data?.message || 'Something went wrong');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loadingProducts ? (
        <Text style={styles.loadingText}>Loading products...</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <View style={styles.productInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.category_name} • IDR {item.price}
                </Text>
                <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
                  <Text style={styles.badgeText}>{item.is_active ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => handleOpenEdit(item)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Product' : 'New Product'}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Product Name"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Price"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
              value={price}
              onChangeText={setPrice}
            />

            <Text style={styles.label}>Select Category</Text>
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
              <Text style={styles.label}>Is Active?</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: theme.colors.surfaceLight, true: theme.colors.primary }}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="danger"
                onPress={() => setModalVisible(false)}
                style={styles.halfBtn}
              />
              <Button title="Save" onPress={handleSave} style={styles.halfBtn} />
            </View>
          </View>
        </View>
      </Modal>
      <BottomTabBar navigation={navigation} activeTab="Products" />
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
});
export default ProductsScreen;
